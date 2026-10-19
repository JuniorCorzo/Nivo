package dev.angelcorzo.nivo.infrastructure.adapter.jpa.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Reusable test configuration providing a shared PostgreSQL Testcontainers instance with @ServiceConnection.
 */
@TestConfiguration(proxyBeanMethods = false)
public class PostgresTestcontainersConfiguration {

  public static final String IMAGE_NAME =
      System.getProperty("testcontainers.postgres.image", "postgis/postgis:16-3.4");

  private static final PostgreSQLContainer<?> CONTAINER;

  static {
    CONTAINER =
        new PostgreSQLContainer<>(
                DockerImageName.parse(IMAGE_NAME).asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("nivo_db")
            .withUsername("postgres")
            .withPassword("postgres")
            .withUrlParam("currentSchema", "nivo,public");
    CONTAINER.start();
  }

  @Bean
  @ServiceConnection
  public PostgreSQLContainer<?> postgresContainer() {
    return CONTAINER;
  }
}
