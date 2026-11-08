package dev.angelcorzo.nivo.infrastructure.adapter.jpa.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.output.MigrateResult;
import org.flywaydb.core.api.output.ValidateResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Tag("migration-validation")
@DisplayName("Flyway Migration Validation Pre-Flight Test (PostgreSQL Testcontainers)")
class FlywayMigrationValidationTest extends AbstractPostgresIntegrationTest {

  @Autowired
  private Flyway flyway;

  @Autowired
  private DataSource dataSource;

  @Test
  @DisplayName("Should successfully validate all applied migration checksums and structure")
  void shouldValidateAllAppliedMigrations() {
    final ValidateResult validateResult = flyway.validateWithResult();

    assertThat(validateResult.validationSuccessful)
      .withFailMessage("Flyway validation failed: %s", validateResult.getAllErrorMessages())
      .isTrue();
    assertThat(validateResult.invalidMigrations).isEmpty();
  }

  @Test
  @DisplayName("Should ensure all discovered migrations are applied with no failed state")
  void shouldEnsureAllMigrationsAppliedWithoutFailure() {
    final MigrationInfo[] allMigrations = flyway.info().all();
    final MigrationInfo[] appliedMigrations = flyway.info().applied();

    assertThat(allMigrations).isNotEmpty();
    assertThat(appliedMigrations).hasSameSizeAs(allMigrations);

    final List<MigrationInfo> failed = Arrays.stream(allMigrations)
      .filter(info -> info.getState().isFailed())
      .toList();

    assertThat(failed)
      .withFailMessage("Found failed migrations in schema history: %s", failed)
      .isEmpty();
  }

  @Test
  @DisplayName("Should be idempotent: second migration run must apply 0 new migrations and succeed")
  void shouldBeIdempotentOnSubsequentMigrateCalls() {
    final MigrateResult secondResult = flyway.migrate();

    assertThat(secondResult.success).isTrue();
    assertThat(secondResult.migrationsExecuted).isZero();
  }

  @Test
  @DisplayName("Should ensure core schema objects exist and PostGIS extension is active")
  void shouldEnsureCoreSchemaObjectsAndPostGisExist() throws Exception {
    try (final Connection connection = dataSource.getConnection();
      final Statement statement = connection.createStatement()) {

      try (final ResultSet rs = statement.executeQuery(
        "SELECT count(*) FROM pg_extension WHERE extname = 'postgis'")) {
        assertThat(rs.next()).isTrue();
        assertThat(rs.getInt(1))
          .withFailMessage("PostGIS extension is required in PostgreSQL")
          .isGreaterThanOrEqualTo(1);
      }

      try (final ResultSet rs = statement.executeQuery(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'nivo'")) {
        final Set<String> tables = new HashSet<>();
        while (rs.next()) {
          tables.add(rs.getString("table_name"));
        }

        assertThat(tables).contains(
          "users",
          "tenants",
          "parking_lots",
          "parking_tickets",
          "rates",
          "slots");
      }
    }
  }
}
