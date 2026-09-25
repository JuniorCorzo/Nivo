# Implementation Plan: Dashboard Analítico, SSE y API Pública (feat-nivo-dashboard)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real-time analytical dashboard with PostgreSQL optimized views (`v_parking_occupancy_hourly`, `v_parking_daily_summary`, `v_parking_operational_report`), dual-scope analytics (**Sede Individual** vs. **Consolidado Global Multi-Sede** a nivel de Tenant con ranking comparativo), backend operational observability with Micrometer (`MeterRegistry`), reactive Server-Sent Events (SSE) streaming with domain event listeners, public availability API with Token Bucket rate limiting (60 req/min per IP), Scalar pre-request auto-authentication, and an Angular 21+ Dashboard UI with Signals, Chart.js visualizations (curvas horarias, donas y gráfico comparativo de barras horizontales), TanStack Table operational reports, streaming CSV export, and `@nivo-sass/design-system` components.

**Architecture:** Hexagonal / Clean Architecture in Spring Boot WebMVC (`apps/api`), domain event decoupling with `ApplicationEventPublisher`, dual-scope REST and SSE streaming (`?parkingId={optionalUUID}`), PostgreSQL views with composite multi-tenant indices, in-memory Token Bucket filter and Caffeine caching. Reactive Angular 21+ in `apps/web` with Signal architecture (`DashboardFacade`), auto-detection of 1 vs. multiple parking facilities, authenticated SSE stream consumption via `fetch` + `ReadableStream`, OnPush Chart.js canvas components, TanStack Table column-driven renderers without template ladders, and strict Design System compliance.

**Tech Stack:** Java 25, Spring Boot 4.0.3, Spring Data JPA, Flyway, PostgreSQL, Micrometer Prometheus, SpringDoc / Scalar OpenAPI, JUnit 5, Mockito, AssertJ, TypeScript 6, Angular 21.2+, Chart.js 4.4+, TanStack Angular Table 8.21+, Tailwind CSS 4, Vitest, Ultracite.

**Spec:** `openspec/changes/2026-09-24-feat-nivo-dashboard/design.md`

## Global Constraints

- Conventional Commits: Use scopes `api(db)`, `api(metrics)`, `api(dashboard)`, `api(sse)`, `api(public)`, `api(scalar)`, `web(dashboard)`, `web(charts)`, `web(reports)`.
- Test-Driven Development: Tests MUST be written and verified failing before implementation.
- Multi-Tenant Security: All dashboard and report queries MUST enforce tenant boundaries from `AuthenticationContextGateway`.
- Telemetry Cardinality: Prometheus metrics MUST NOT include high-cardinality tags (`parkingId`, `tenantId`, `licensePlate`). Tenant business stats reside exclusively in PostgreSQL.
- TanStack Table Rule: NEVER use `@if / @else if (column.id === ...)` ladders in HTML templates. Encapsulate headers and cells in column definitions.
- Design System Mandate: ALWAYS use `@nivo-sass/design-system` components (`nv-card`, `nv-button`, `nv-badge`, `nv-input`, `nv-typography`, `nv-loader`) instead of raw HTML elements.

---

### Task 1: Database Schema Migration & JPA Views Persistence (`apps/api`)

**Files:**

- Create: `apps/api/src/main/resources/db/migration/V5__create_dashboard_views_and_analytics.sql`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/HourlyOccupancyViewEntity.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/DailySummaryViewEntity.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/OperationalReportViewEntity.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/repository/HourlyOccupancyViewRepository.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/repository/DailySummaryViewRepository.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/repository/OperationalReportViewRepository.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/DashboardViewsRepositoryTest.java`

**Interfaces:**

- Consumes: PostgreSQL base tables `parking_tickets`, `slots`, `payments`, `parking_lots`.
- Produces: `v_parking_occupancy_hourly`, `v_parking_daily_summary`, `v_parking_operational_report` views with composite indices, and Spring Data JPA repositories supporting queries by `tenantId` and `(tenantId, parkingLotId)`.

- [ ] **Step 1: Write failing integration test for dashboard views repositories**

```java
package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.DailySummaryViewRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.HourlyOccupancyViewRepository;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class DashboardViewsRepositoryTest {

  @Autowired
  private HourlyOccupancyViewRepository hourlyRepository;

  @Autowired
  private DailySummaryViewRepository dailyRepository;

  @Test
  @DisplayName("Should query hourly occupancy view by tenant and parking lot")
  void shouldQueryHourlyOccupancyViewByParkingLot() {
    var result = hourlyRepository.findByTenantIdAndParkingLotId(UUID.randomUUID(), UUID.randomUUID());
    assertThat(result).isNotNull();
  }

  @Test
  @DisplayName("Should query consolidated daily summary across all parking lots of a tenant")
  void shouldQueryConsolidatedDailySummaryByTenant() {
    var result = dailyRepository.findAllByTenantId(UUID.randomUUID());
    assertThat(result).isNotNull();
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.DashboardViewsRepositoryTest"
```

- [ ] **Step 3: Write minimal implementation**

Create `apps/api/src/main/resources/db/migration/V5__create_dashboard_views_and_analytics.sql`:

```sql
CREATE OR REPLACE VIEW nivo.v_parking_occupancy_hourly AS
WITH hourly_buckets AS (
    SELECT
        t.tenant_id,
        s.parking_lot_id,
        date_trunc('hour', t.entry_time) AS hour_bucket,
        COUNT(t.id) AS checkin_count
    FROM nivo.parking_tickets t
    JOIN nivo.slots s ON s.id = t.slot_id
    WHERE t.deleted_at IS NULL
    GROUP BY t.tenant_id, s.parking_lot_id, date_trunc('hour', t.entry_time)
),
hourly_exits AS (
    SELECT
        t.tenant_id,
        s.parking_lot_id,
        date_trunc('hour', t.exit_time) AS hour_bucket,
        COUNT(t.id) AS checkout_count
    FROM nivo.parking_tickets t
    JOIN nivo.slots s ON s.id = t.slot_id
    WHERE t.exit_time IS NOT NULL AND t.deleted_at IS NULL
    GROUP BY t.tenant_id, s.parking_lot_id, date_trunc('hour', t.exit_time)
),
slot_capacities AS (
    SELECT
        parking_lot_id,
        COUNT(id) AS total_slots
    FROM nivo.slots
    WHERE deleted_at IS NULL AND status != 'MAINTENANCE'
    GROUP BY parking_lot_id
)
SELECT
    COALESCE(b.tenant_id, e.tenant_id) AS tenant_id,
    COALESCE(b.parking_lot_id, e.parking_lot_id) AS parking_lot_id,
    COALESCE(b.hour_bucket, e.hour_bucket) AS hour_bucket,
    COALESCE(b.checkin_count, 0) AS checkins,
    COALESCE(e.checkout_count, 0) AS checkouts,
    COALESCE(cap.total_slots, 0) AS total_capacity,
    ROUND(
        LEAST(100.0, GREATEST(0.0,
            (COALESCE(b.checkin_count, 0) * 100.0) / NULLIF(cap.total_slots, 0)
        )), 2
    ) AS estimated_occupancy_rate
FROM hourly_buckets b
FULL OUTER JOIN hourly_exits e
    ON b.parking_lot_id = e.parking_lot_id AND b.hour_bucket = e.hour_bucket
JOIN slot_capacities cap
    ON cap.parking_lot_id = COALESCE(b.parking_lot_id, e.parking_lot_id);

CREATE OR REPLACE VIEW nivo.v_parking_daily_summary AS
SELECT
    s.parking_lot_id,
    p.tenant_id,
    p.name AS parking_name,
    date_trunc('day', t.entry_time)::date AS summary_date,
    COUNT(t.id) AS total_tickets,
    COUNT(t.id) FILTER (WHERE t.status = 'CLOSED') AS completed_tickets,
    COUNT(t.id) FILTER (WHERE t.status = 'OPEN') AS ongoing_tickets,
    COUNT(DISTINCT t.license_plate) AS unique_vehicles,
    COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'PAID'), 0.00) AS total_revenue,
    ROUND(AVG(EXTRACT(EPOCH FROM (t.exit_time - t.entry_time)) / 60.0) FILTER (WHERE t.status = 'CLOSED'), 2) AS avg_duration_minutes,
    p.currency
FROM nivo.parking_tickets t
JOIN nivo.slots s ON s.id = t.slot_id
JOIN nivo.parking_lots p ON p.id = s.parking_lot_id
LEFT JOIN nivo.payments pay ON pay.parking_ticket_id = t.id AND pay.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY s.parking_lot_id, p.tenant_id, p.name, date_trunc('day', t.entry_time)::date, p.currency;

CREATE OR REPLACE VIEW nivo.v_parking_operational_report AS
SELECT
    t.id AS ticket_id,
    t.tenant_id,
    p.id AS parking_lot_id,
    p.name AS parking_name,
    t.license_plate,
    s.slot_number,
    s.zone AS slot_zone,
    s.prefix AS slot_prefix,
    s.type AS slot_type,
    r.name AS rate_name,
    t.entry_time,
    t.exit_time,
    ROUND(EXTRACT(EPOCH FROM (COALESCE(t.exit_time, CURRENT_TIMESTAMP) - t.entry_time)) / 60.0, 1) AS duration_minutes,
    t.status AS ticket_status,
    t.total_to_charge,
    pay.id AS payment_id,
    pay.status AS payment_status,
    pay.payment_method,
    pay.amount AS paid_amount,
    pay.completed_at AS payment_date,
    u.full_name AS operator_or_user_name,
    u.email AS user_email
FROM nivo.parking_tickets t
JOIN nivo.slots s ON s.id = t.slot_id
JOIN nivo.parking_lots p ON p.id = s.parking_lot_id
JOIN nivo.rates r ON r.id = t.rate_id
LEFT JOIN nivo.payments pay ON pay.parking_ticket_id = t.id AND pay.deleted_at IS NULL
LEFT JOIN nivo.users u ON u.id = t.user_id
WHERE t.deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_parking_tickets_tenant_entry
    ON nivo.parking_tickets (tenant_id, entry_time) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_parking_tickets_tenant_exit
    ON nivo.parking_tickets (tenant_id, exit_time) WHERE exit_time IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_slots_tenant_parking_status
    ON nivo.slots (tenant_id, parking_lot_id, status) WHERE deleted_at IS NULL;
```

Create JPA entities: `HourlyOccupancyViewEntity`, `DailySummaryViewEntity`, `OperationalReportViewEntity` with `@Immutable`.
Create Spring Data repositories extending `JpaRepository`.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.DashboardViewsRepositoryTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(db)): add analytics views with multi-parking support and composite indexes"
```

---

### Task 2: Backend Operational Metrics Manager with Micrometer (`apps/api`)

**Files:**

- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/metrics/BackendOperationsMetricsManager.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/adapter/metrics/BackendOperationsMetricsManagerTest.java`

**Interfaces:**

- Consumes: `io.micrometer.core.instrument.MeterRegistry`.
- Produces:
  - `recordSseConnectionOpened()`, `recordSseConnectionClosed()`
  - `recordSseEventBroadcast()`, `recordSseDisconnect()`
  - `recordAnalyticsQueryDuration(String view, Runnable query)`
  - `recordPublicAvailabilityRequest(int statusCode)`
  - `recordPublicAvailabilityRateLimited()`
  - `recordAvailabilityCacheHit()`, `recordAvailabilityCacheMiss()`
  - `recordCsvExportDuration(Runnable export)`

- [ ] **Step 1: Write failing unit test**

```java
package dev.angelcorzo.nivo.infrastructure.adapter.metrics;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BackendOperationsMetricsManagerTest {

  private SimpleMeterRegistry meterRegistry;
  private BackendOperationsMetricsManager metricsManager;

  @BeforeEach
  void setUp() {
    meterRegistry = new SimpleMeterRegistry();
    metricsManager = new BackendOperationsMetricsManager(meterRegistry);
  }

  @Test
  @DisplayName("Should increment active SSE connections gauge")
  void shouldTrackSseActiveConnections() {
    metricsManager.recordSseConnectionOpened();
    assertThat(meterRegistry.get("sse.dashboard.active.connections").gauge().value()).isEqualTo(1.0);

    metricsManager.recordSseConnectionClosed();
    assertThat(meterRegistry.get("sse.dashboard.active.connections").gauge().value()).isEqualTo(0.0);
  }

  @Test
  @DisplayName("Should record query duration without high-cardinality tags")
  void shouldRecordQueryDurationWithLowCardinalityTag() {
    metricsManager.recordAnalyticsQueryDuration("hourly", () -> {});
    assertThat(meterRegistry.get("db.analytics.query.duration").tag("view", "hourly").timer().count()).isEqualTo(1);
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManagerTest"
```

- [ ] **Step 3: Write minimal implementation**

Implement `BackendOperationsMetricsManager` with:

- Gauges for `sse.dashboard.active.connections`.
- Counters for `sse.dashboard.events.broadcast.total`, `sse.dashboard.disconnects.total`.
- Timers for `db.analytics.query.duration` (tag `view`), `domain.events.dispatch.duration` (tag `event_type`), `reports.csv.export.duration`.
- Public availability telemetry (`requests.total`, `rate_limited.total`, `latency`, `cache.hit`, `cache.miss`).

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManagerTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(metrics)): implement BackendOperationsMetricsManager for platform observability"
```

---

### Task 3: REST Analytics Endpoints & Streaming CSV Export with Scope Support (`apps/api`)

**Files:**

- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetDashboardSummaryUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetHourlyOccupancyUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetParkingsComparisonUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetOperationalReportUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/DashboardController.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/reports/ReportsController.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/DashboardControllerTest.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetParkingsComparisonUseCaseTest.java`

**Interfaces:**

- Consumes: JPA view repositories, `AuthenticationContextGateway`.
- Produces:
  - `GET /api/v1/dashboard/summary?parkingId={optionalUUID}` -> `DashboardSummaryDTO`
  - `GET /api/v1/dashboard/occupancy-hourly?parkingId={optionalUUID}&startDate=...&endDate=...` -> `List<HourlyOccupancyDTO>`
  - `GET /api/v1/dashboard/parkings-comparison?startDate=...&endDate=...` -> `List<ParkingComparisonDTO>`
  - `GET /api/v1/reports/operational?parkingId={optionalUUID}&page=...` -> `Page<OperationalReportDTO>`
  - `GET /api/v1/reports/operational/csv?parkingId={optionalUUID}` -> `text/csv` stream

- [ ] **Step 1: Write failing controller test for dashboard summary and comparison**

```java
package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @WithMockUser
  @DisplayName("GET /api/v1/dashboard/summary without parkingId should return tenant global summary")
  void shouldReturnGlobalSummary() throws Exception {
    mockMvc.perform(get("/api/v1/dashboard/summary"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scope").value("GLOBAL"));
  }

  @Test
  @WithMockUser
  @DisplayName("GET /api/v1/dashboard/parkings-comparison should return comparative facilities list")
  void shouldReturnParkingsComparison() throws Exception {
    mockMvc.perform(get("/api/v1/dashboard/parkings-comparison"))
        .andExpect(status().isOk());
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.DashboardControllerTest"
```

- [ ] **Step 3: Write minimal implementation**

Implement `GetDashboardSummaryUseCase`, `GetHourlyOccupancyUseCase`, `GetParkingsComparisonUseCase`, `GetOperationalReportUseCase`.
Expose `DashboardController` and `ReportsController`.
Inject `AuthenticationContextGateway` to resolve `tenantId`.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.DashboardControllerTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(dashboard)): implement multi-parking summary, comparison and reports endpoints"
```

---

### Task 4: SseEmitter Registry with Multi-Parking & Tenant Broadcast (`apps/api`)

**Files:**

- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/DashboardSseRegistry.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/DashboardStreamController.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/listeners/DashboardDomainEventListener.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/DashboardSseRegistryTest.java`

**Interfaces:**

- Consumes: `ApplicationEventPublisher`, domain events (`TicketCreated`, `TicketCheckedOut`, `PaymentCompleted`).
- Produces:
  - `GET /api/v1/dashboard/stream?parkingId={optionalUUID}` -> `text/event-stream`
  - Dual broadcast: emits to specific facility subscribers AND tenant-wide subscribers.

- [ ] **Step 1: Write failing unit test for dual-scope SseRegistry**

```java
package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class DashboardSseRegistryTest {

  private DashboardSseRegistry sseRegistry;
  private BackendOperationsMetricsManager metricsManager;

  @BeforeEach
  void setUp() {
    metricsManager = mock(BackendOperationsMetricsManager.class);
    sseRegistry = new DashboardSseRegistry(metricsManager);
  }

  @Test
  @DisplayName("Should broadcast to both facility subscriber and tenant global subscriber")
  void shouldBroadcastToBothFacilityAndTenantSubscribers() {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();

    var singleEmitter = sseRegistry.createEmitter(tenantId, parkingId);
    var globalEmitter = sseRegistry.createEmitter(tenantId, null);

    assertThat(singleEmitter).isNotNull();
    assertThat(globalEmitter).isNotNull();

    sseRegistry.broadcast(tenantId, parkingId, "occupancy-update", "{\"occupancyRate\": 75.0}");
    assertThat(sseRegistry.getActiveCount(tenantId)).isEqualTo(2);
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.DashboardSseRegistryTest"
```

- [ ] **Step 3: Write minimal implementation**

Implement `DashboardSseRegistry`:

- `ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>>` using keys `tenantId` and `tenantId + ":" + parkingId`.
- On ticket event: broadcast to `tenantId + ":" + parkingId` AND `tenantId`.
- Heartbeat ping every 15s.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.DashboardSseRegistryTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(sse)): support dual-scope SSE streaming for single parking and tenant global channels"
```

---

### Task 5: Scalar Pre-Request Auto-Authentication Script Hook (`apps/api`)

**Files:**

- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/commons/config/SwaggerConfiguration.java`
- Modify: `apps/api/src/main/resources/application.yaml`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/commons/config/SwaggerConfigurationTest.java`

**Interfaces:**

- Consumes: Scalar WebMVC configuration and OpenAPI 3.0 specification.
- Produces: `x-scalar-pre-request` OpenAPI extension auto-authenticating with `/api/v1/auth/login`.

- [ ] **Step 1: Write test verifying OpenAPI security schemes and Scalar extension**

```java
package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config;

import static org.assertj.core.api.Assertions.assertThat;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SwaggerConfigurationTest {

  @Autowired
  private OpenAPI openAPI;

  @Test
  @DisplayName("Should register security schemes and pre-request configuration")
  void shouldHaveSecuritySchemesAndPreRequestConfig() {
    assertThat(openAPI.getComponents().getSecuritySchemes()).containsKey("Bearer Authentication");
  }
}
```

- [ ] **Step 2: Run test to verify failure / pass**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.SwaggerConfigurationTest"
```

- [ ] **Step 3: Write minimal implementation**

Enrich `SwaggerConfiguration.java` with a custom `OpenApiCustomizer` bean adding pre-request hook configuration.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.SwaggerConfigurationTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(scalar)): add Scalar pre-request auto-authentication hook"
```

---

### Task 6: Public Availability API with Token Bucket Rate Limiting (`apps/api`)

**Files:**

- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/security/ratelimit/TokenBucketRateLimiter.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/security/ratelimit/PublicApiRateLimitFilter.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/publicapi/PublicAvailabilityController.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/security/config/SecurityChain.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/security/ratelimit/TokenBucketRateLimiterTest.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/publicapi/PublicAvailabilityControllerTest.java`

**Interfaces:**

- Consumes: IP address, `parkingId`, Caffeine in-memory cache.
- Produces: `GET /api/v1/public/parkings/{parkingId}/availability` (HTTP 200, 404, 429).

- [ ] **Step 1: Write failing unit test for Token Bucket rate limiter**

```java
package dev.angelcorzo.nivo.infrastructure.security.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TokenBucketRateLimiterTest {

  @Test
  @DisplayName("Should allow up to 60 tokens and reject the 61st within the same minute")
  void shouldRateLimitAfterCapacityExhausted() {
    var limiter = new TokenBucketRateLimiter(60, 60);
    String clientIp = "192.168.1.100";

    for (int i = 0; i < 60; i++) {
      assertThat(limiter.tryConsume(clientIp)).isTrue();
    }
    assertThat(limiter.tryConsume(clientIp)).isFalse();
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.security.ratelimit.TokenBucketRateLimiterTest"
```

- [ ] **Step 3: Write minimal implementation**

Implement `TokenBucketRateLimiter`, `PublicApiRateLimitFilter`, and `PublicAvailabilityController` with Caffeine 30s cache. Permit `/api/v1/public/**` in `SecurityChain.java`.

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.security.ratelimit.*"
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi.*"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(public)): implement public availability API with Token Bucket rate limiting and cache"
```

---

### Task 7: Chart.js Installation & Angular Presentational Charts with Comparison (`apps/web`)

**Files:**

- Modify: `apps/web/package.json`
- Create: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/occupancy-trend-chart.ts`
- Create: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/occupancy-trend-chart.html`
- Create: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/occupancy-trend-chart.spec.ts`
- Create: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/slot-distribution-donut-chart.ts`
- Create: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/slot-distribution-donut-chart.html`
- Create: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/slot-distribution-donut-chart.spec.ts`
- Create: `apps/web/src/app/features/dashboard/components/parking-comparison-chart/parking-comparison-chart.ts`
- Create: `apps/web/src/app/features/dashboard/components/parking-comparison-chart/parking-comparison-chart.html`
- Create: `apps/web/src/app/features/dashboard/components/parking-comparison-chart/parking-comparison-chart.spec.ts`

**Interfaces:**

- Consumes: Chart.js library, inputs `HourlyOccupancyPoint[]`, `SlotDistributionItem[]`, `ParkingComparisonItem[]`.
- Produces: Standalone `OnPush` components wrapping HTML canvas with proper cleanup in `ngOnDestroy`.

- [ ] **Step 1: Install Chart.js**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun add chart.js
```

- [ ] **Step 2: Write failing component tests**

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ParkingComparisonChartComponent } from "./parking-comparison-chart";

describe("ParkingComparisonChartComponent", () => {
  let component: ParkingComparisonChartComponent;
  let fixture: ComponentFixture<ParkingComparisonChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingComparisonChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingComparisonChartComponent);
    component = fixture.componentInstance;
  });

  it("should render horizontal bar chart comparing facilities", () => {
    fixture.componentRef.setInput("data", [
      {
        parkingId: "1",
        parkingName: "Sede Centro",
        totalSlots: 100,
        occupiedSlots: 70,
        occupancyRate: 70.0,
        todayRevenue: 300000,
        activeTickets: 70,
        avgStayMinutes: 60,
      },
      {
        parkingId: "2",
        parkingName: "Sede Norte",
        totalSlots: 50,
        occupiedSlots: 20,
        occupancyRate: 40.0,
        todayRevenue: 100000,
        activeTickets: 20,
        avgStayMinutes: 45,
      },
    ]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run test to verify failure**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test parking-comparison-chart.spec.ts
```

- [ ] **Step 4: Write minimal implementation**

Implement `OccupancyTrendChartComponent`, `SlotDistributionDonutChartComponent`, and `ParkingComparisonChartComponent`.
Ensure all use `ChangeDetectionStrategy.OnPush` and call `chart?.destroy()` in `ngOnDestroy()`.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test occupancy-trend-chart.spec.ts slot-distribution-donut-chart.spec.ts parking-comparison-chart.spec.ts
```

- [ ] **Step 6: Commit changes**

```bash
git commit -m "feat(web(charts)): integrate Chart.js with occupancy trend, donut, and parking comparison charts"
```

---

### Task 8: DashboardFacade & Operational Reports TanStack Table with Multi-Parking Scope (`apps/web`)

**Files:**

- Create: `apps/web/src/app/features/dashboard/facade/dashboard.facade.ts`
- Create: `apps/web/src/app/features/dashboard/facade/dashboard.facade.spec.ts`
- Create: `apps/web/src/app/features/dashboard/components/operational-reports-table/operational-reports-table.ts`
- Create: `apps/web/src/app/features/dashboard/components/operational-reports-table/operational-reports-table.html`
- Create: `apps/web/src/app/features/dashboard/components/operational-reports-table/operational-reports-table.spec.ts`

**Interfaces:**

- Consumes: `@tanstack/angular-table`, backend endpoints `/dashboard/summary`, `/dashboard/stream`, `/dashboard/parkings-comparison`, `/reports/operational`, `/reports/operational/csv`.
- Produces:
  - `DashboardFacade` state (`activeScope`, `isMultiParkingTenant`, `summary`, `parkingsComparison`, `reports`).
  - `OperationalReportsTableComponent` with dynamic column `parkingName` for global scope and 0 template `@if` ladders.

- [ ] **Step 1: Write failing facade unit test**

```typescript
import { TestBed } from "@angular/core/testing";
import { DashboardFacade } from "./dashboard.facade";

describe("DashboardFacade", () => {
  let facade: DashboardFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardFacade],
    });
    facade = TestBed.inject(DashboardFacade);
  });

  it("should detect multi-parking tenant when accessibleParkings has > 1 items", () => {
    facade.accessibleParkings.set([
      { id: "1", name: "Sede Centro" },
      { id: "2", name: "Sede Norte" },
    ]);
    expect(facade.isMultiParkingTenant()).toBe(true);
    expect(facade.activeScope().mode).toBe("GLOBAL");
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard.facade.spec.ts
```

- [ ] **Step 3: Write minimal implementation**

Implement `DashboardFacade` with signals:

- `accessibleParkings`, `activeScope`, `isMultiParkingTenant`, `summary`, `occupancyHourly`, `parkingsComparison`, `reports`.
- Dynamic SSE URL construction based on `activeScope()`.
- Implement `OperationalReportsTableComponent` with TanStack column definitions; conditionally render `parkingName` column when `activeScope().mode === 'GLOBAL'`.

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard.facade.spec.ts operational-reports-table.spec.ts
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(web(reports)): implement DashboardFacade with multi-parking scope and TanStack table"
```

---

### Task 9: Dashboard Main Page Integration with Multi-Parking Scope & Design System (`apps/web`)

**Files:**

- Modify: `apps/web/src/app/features/dashboard/page/dashboard-page.ts`
- Modify: `apps/web/src/app/features/dashboard/page/dashboard-page.html`
- Modify: `apps/web/src/app/features/dashboard/page/dashboard-page.spec.ts`

**Interfaces:**

- Consumes: `DashboardFacade`, `@nivo-sass/design-system`, `PageHeaderComponent`.
- Produces: Integrated view with scope selector ("🏢 Todas las Sedes (Consolidado Global)" vs individual parking), KPI cards, comparison chart in global mode, trend chart, and report table.

- [ ] **Step 1: Write failing page integration test**

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DashboardPage } from "./dashboard-page";

describe("DashboardPage", () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should render page header and kpi cards", () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard-page.spec.ts
```

- [ ] **Step 3: Write minimal implementation**

Update `dashboard-page.ts` and `dashboard-page.html`:

- Include scope selector chip in page header when `facade.isMultiParkingTenant()` is true.
- If in `GLOBAL` mode: render `<app-parking-comparison-chart />` alongside KPI cards.
- Render `<app-occupancy-trend-chart />`, `<app-slot-distribution-donut-chart />`, and `<app-operational-reports-table />`.
- All controls use `@nivo-sass/design-system` components (`nv-card`, `nv-badge`, `nv-button`, `nv-typography`, `nv-input`, `nv-select`, `nv-loader`).

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard-page.spec.ts
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(web(dashboard)): integrate DashboardPage with multi-parking scope and Design System"
```

---

### Task 10: E2E and Full Test Verification (`apps/api` & `apps/web`)

**Files:**

- Modify: Test suites in backend and frontend.

**Interfaces:**

- Consumes: Entire feature surface across backend and frontend.
- Produces: 100% passing test suites, zero regressions, and verified build.

- [ ] **Step 1: Run complete backend test suite**

```bash
./gradlew test
```

Verify that all tests pass including `DashboardViewsRepositoryTest`, `BackendOperationsMetricsManagerTest`, `DashboardControllerTest`, `PublicAvailabilityControllerTest`, and `DashboardSseRegistryTest`.

- [ ] **Step 2: Run complete frontend test suite and linters**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web
bun test
bun run check
```

Verify that all Angular components pass tests and Ultracite/Oxlint checks pass cleanly.

- [ ] **Step 3: Commit final verification**

```bash
git commit -m "test(dashboard): verify full test coverage and lint checks for feat-nivo-dashboard"
```
