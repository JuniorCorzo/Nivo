package dev.angelcorzo.nivo.infrastructure.adapter.jpa.config;

import java.util.Arrays;
import java.util.List;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
@ConditionalOnProperty(name = "spring.flyway.enabled", havingValue = "true", matchIfMissing = true)
public class FlywayConfig {

  private final Environment environment;
  private final String locations;

  public FlywayConfig(
      final Environment environment,
      @Value("${spring.flyway.locations:classpath:db/migration}") final String locations) {
    this.environment = environment;
    this.locations = locations;
  }

  @Bean(initMethod = "migrate")
  public Flyway flyway(final DataSource dataSource) {
    final String[] effectiveLocations = resolveEffectiveLocations();

    return Flyway.configure()
        .dataSource(dataSource)
        .schemas("nivo", "public")
        .defaultSchema("nivo")
        .createSchemas(true)
        .locations(effectiveLocations)
        .load();
  }

  public String[] resolveEffectiveLocations() {
    final List<String> activeProfiles = Arrays.asList(environment.getActiveProfiles());
    final boolean isDevOrLocal = activeProfiles.contains("dev") || activeProfiles.contains("local");

    return Arrays.stream(locations.split(","))
        .map(String::trim)
        .filter(location -> !location.isEmpty())
        .filter(location -> isDevOrLocal || !location.contains("seeds"))
        .toArray(String[]::new);
  }
}
