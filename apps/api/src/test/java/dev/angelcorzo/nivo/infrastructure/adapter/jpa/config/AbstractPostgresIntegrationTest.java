package dev.angelcorzo.nivo.infrastructure.adapter.jpa.config;

import dev.angelcorzo.nivo.domain.model.commons.encryption.gateways.EncryptionGateway;
import org.springframework.context.annotation.Import;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Base abstract class for JPA tests requiring a real PostgreSQL instance via Testcontainers.
 *
 * <p>Uses the official PostGIS/PostgreSQL 16 image by default to match production and Docker Compose,
 * supports overriding via `testcontainers.postgres.image` system property, and configures PostgreSQL
 * dialect, schema, Flyway migrations, and disables H2 schema initialization.
 */
@Import(FlywayConfig.class)
public abstract class AbstractPostgresIntegrationTest {

  @MockitoBean protected EncryptionGateway encryptionGateway;

  public static final String POSTGRES_IMAGE =
      System.getProperty("testcontainers.postgres.image", "postgis/postgis:16-3.4");

  @ServiceConnection
  protected static final PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>(
              DockerImageName.parse(POSTGRES_IMAGE).asCompatibleSubstituteFor("postgres"))
          .withDatabaseName("nivo_db")
          .withUsername("postgres")
          .withPassword("postgres")
          .withUrlParam("currentSchema", "nivo,public");

  static {
    postgres.start();
  }

  @DynamicPropertySource
  static void registerPostgresProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
    registry.add("spring.jpa.databasePlatform", () -> "org.hibernate.dialect.PostgreSQLDialect");
    registry.add("spring.sql.init.mode", () -> "never");
    registry.add("spring.flyway.enabled", () -> "true");
    registry.add("spring.flyway.schemas", () -> "nivo,public");
    registry.add("spring.flyway.default-schema", () -> "nivo");
    registry.add("spring.flyway.create-schemas", () -> "true");
    registry.add("spring.flyway.locations", () -> "classpath:db/migration");
    registry.add("spring.jpa.properties.hibernate.default_schema", () -> "nivo");
    registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
  }
}
