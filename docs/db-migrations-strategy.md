# Production Database Migrations Strategy & Runbook

## 1. Overview & Context

Nivo is a multi-tenant SaaS parking management platform running **Spring Boot 4 (Java 25)** and **PostgreSQL 16 with PostGIS**.

In our production deployment:
- **Homelab Infrastructure**: The PostgreSQL database runs inside an isolated self-hosted environment (Dokploy / Docker Compose) without a public IP.
- **Tailscale Mesh Network**: Access to the database for administrative and emergency operations is restricted exclusively to authenticated nodes via **Tailscale** (private IP / MagicDNS).
- **Automated Startup Migrations**: The Spring Boot API executes Flyway migrations automatically upon container boot.

This runbook defines the architecture, resilience settings, zero-downtime rules, and emergency resolution procedures for database schema evolution.

---

## 2. Flyway Resilience Configuration

The API configuration in `apps/api/src/main/resources/application.yaml` and `FlywayConfig.java` enforces production-grade resilience:

```yaml
spring:
  flyway:
    enabled: ${SPRING_FLYWAY_ENABLED:true}
    schemas: ${SPRING_FLYWAY_SCHEMAS:nivo,public}
    default-schema: ${SPRING_FLYWAY_DEFAULT_SCHEMA:nivo}
    locations: ${SPRING_FLYWAY_LOCATIONS:classpath:db/migration}
    out-of-order: ${SPRING_FLYWAY_OUT_OF_ORDER:true}
    validate-on-migrate: ${SPRING_FLYWAY_VALIDATE_ON_MIGRATE:true}
    clean-disabled: ${SPRING_FLYWAY_CLEAN_DISABLED:true}
    baseline-on-migrate: ${SPRING_FLYWAY_BASELINE_ON_MIGRATE:false}
    connect-retries: ${SPRING_FLYWAY_CONNECT_RETRIES:10}
    connect-retries-interval: ${SPRING_FLYWAY_CONNECT_RETRIES_INTERVAL:5}
    lock-retry-count: ${SPRING_FLYWAY_LOCK_RETRY_COUNT:50}
```

### Key Parameters Explained:

| Property | Value | Purpose |
| :--- | :--- | :--- |
| `out-of-order` | `true` | **Solves branch merge order collision**. If `V14` deploys before `V13`, Flyway applies `V13` on the next run instead of aborting. |
| `lock-retry-count` | `50` | **Prevents container boot collisions**. When multiple API replicas start simultaneously, secondary replicas retry acquiring the migration lock up to 50 times instead of crashing. |
| `connect-retries` | `10` | **Network resilience**. Retries database connection up to 10 times during database restarts or network warm-up. |
| `validate-on-migrate` | `true` | **Integrity protection**. Fails immediately if an already-applied migration file in Git was modified after deployment. |
| `clean-disabled` | `true` | **Disaster prevention**. Permanently disables `flyway clean` to avoid catastrophic data loss in production. |

---

## 3. Zero-Downtime Database Changes: Expand-Contract Pattern

During rolling releases, both old (`v1.0`) and new (`v1.1`) application containers run concurrently for a period of time. Schema changes must **never break running code**.

```
[Release N: Expand]  ---> Add new column/table (Nullable) -> Deploy Code N (writes both)
[Release N+1: Backfill] -> Backfill historical data in batches
[Release N+2: Contract] -> Switch reads to new structure -> Drop deprecated columns
```

### Golden Rules:

1. **Never rename a column or table in a single step**:
   - *Bad*: `ALTER TABLE users RENAME COLUMN phone TO mobile;` (Crashes running v1.0 app instantly).
   - *Good*: Add `mobile`, dual-write in v1.1, backfill, switch reads in v1.2, drop `phone` in v1.3.
2. **Never add a `NOT NULL` column without a default to an existing populated table**:
   - *Bad*: `ALTER TABLE tickets ADD COLUMN payment_method VARCHAR NOT NULL;` (Fails if table has rows, or locks table indefinitely).
   - *Good*: Add as `NULLABLE`, populate historical rows with a default, then add constraint.
3. **Lock Safety & Timeouts**:
   - Heavy DDL operations acquire an `ACCESS EXCLUSIVE` lock in PostgreSQL.
   - Set a statement lock timeout in migration scripts when altering large tables:
     ```sql
     SET LOCAL lock_timeout = '3s';
     ```
4. **Index Creation**:
   - For high-traffic or large tables, prefer non-blocking index creation when executed outside single-statement transactions, or ensure indexes are created during low-traffic maintenance windows.

---

## 4. Pre-Flight Validation in Local & CI

Because the Homelab database is isolated behind **Tailscale**, GitHub Actions CI cannot and should not connect directly to production.

Instead, we use **Testcontainers** running the identical Docker image (`postgis/postgis:16-3.4`) inside the CI runner:

### Running Validation Locally

Developers should execute the migration test before pushing a PR:

```bash
./apps/api/gradlew -p apps/api validateMigrations
```

### What Pre-Flight Verifies:
1. **Fresh Execution**: All scripts from `V1` to `V_latest` run cleanly against a fresh PostGIS database.
2. **Checksum Integrity**: `flyway.validateWithResult()` verifies that all scripts match expected descriptions and checksums.
3. **Idempotency**: Runs a second migration pass verifying `migrationsExecuted == 0` with zero errors.
4. **No Failed States**: Asserts that no script in `flyway_schema_history` ends with `success = false`.
5. **Schema Consistency**: Validates that required spatial extensions (`postgis`) and core tables (`users`, `tenants`, `parking_lots`, etc.) exist.

---

## 5. Emergency Runbook: Resolving `failed = true` in Production

If a migration fails during deployment, Flyway records `success = false` in `nivo.flyway_schema_history`. All subsequent deployments will fail with:

```text
FlywayException: Migration V__xxx failed! Please restore backups and roll back database and code!
```

### Step 1: Connect to Homelab Database via Tailscale

Ensure your local Tailscale client is connected:

```bash
tailscale status
```

#### Option A: Direct Connection via Tailscale IP
```bash
psql -h <HOMELAB_TAILSCALE_IP> -p 5432 -U postgres -d nivo_db
```

#### Option B: Via SSH over Tailscale to Homelab Host
```bash
ssh user@<HOMELAB_TAILSCALE_IP>
docker exec -it nivo_database psql -U postgres -d nivo_db
```

### Step 2: Inspect the Failed Migration

Check the last recorded entries in `flyway_schema_history`:

```sql
SELECT
    installed_rank,
    version,
    description,
    type,
    script,
    installed_on,
    execution_time,
    success
FROM nivo.flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 5;
```

Inspect API container logs to find the exact SQL exception:
```bash
docker logs --tail=100 nivo_api
```

### Step 3: Resolution Protocol

#### Scenario A: Script Failed and Rolled Back Cleanly (Transactional DDL)
PostgreSQL supports transactional DDL. If the script failed inside a transaction, the partial changes were rolled back automatically, but the `failed = true` record remains in Flyway.

1. Verify that the table/column from the failed script does not exist:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'nivo' AND table_name = '<table_from_script>';
   ```
2. Remove the failed row from `flyway_schema_history`:
   ```sql
   DELETE FROM nivo.flyway_schema_history
   WHERE version = '<FAILED_VERSION>' AND success = false;
   ```
3. Fix the SQL script in your branch, push the fix, and let CI validate it.
4. Redeploy the API container. Flyway will re-attempt the migration cleanly.

#### Scenario B: Non-Transactional Partial Failure
If the script contained statements that cannot run inside a transaction (or executed partial commits):

1. Manually clean up any dangling objects created by the failed migration:
   ```sql
   DROP TABLE IF EXISTS nivo.<partial_table>;
   DROP INDEX IF EXISTS nivo.<partial_index>;
   ```
2. Delete the failed entry:
   ```sql
   DELETE FROM nivo.flyway_schema_history
   WHERE version = '<FAILED_VERSION>' AND success = false;
   ```
3. Fix the script and redeploy.

#### Scenario C: Checksum Mismatch (`ValidateException: Migration checksum mismatch`)
Occurs when someone modified an already-applied migration file in Git:

1. **If the change was cosmetic (whitespace, comments)** and the database is already correct:
   Compute or obtain the new checksum from the error log, and update the history table:
   ```sql
   UPDATE nivo.flyway_schema_history
   SET checksum = <NEW_CHECKSUM>
   WHERE version = '<VERSION>';
   ```
2. **If the schema actually requires changes**: Never edit an old migration. Revert the old file in Git and create a new forward migration (`V<next>__fix_...sql`).

---

## 6. PR Review Checklist for Database Migrations

Before approving any PR containing files in `apps/api/src/main/resources/db/migration/`:

- [ ] **Naming**: Filename follows `V<number>__<description_with_underscores>.sql` (e.g. `V13__add_vehicle_color.sql`).
- [ ] **Zero-Downtime Compliance**:
  - [ ] No `DROP COLUMN` or `RENAME COLUMN` without a phased expand-contract strategy.
  - [ ] New columns added to existing tables are `NULLABLE` or have a safe default.
- [ ] **Lock Safety**: Any index or constraint on large tables specifies appropriate timeouts or non-blocking creation.
- [ ] **CI Pre-Flight**: GitHub Actions check `Validate Database Migrations (Pre-Flight)` passed green.
- [ ] **Schema Sync**: If entities changed, JPA `@Entity` matches the updated schema.
