package dev.angelcorzo.nivo.infrastructure.adapter.jpa.config;

import java.util.Arrays;
import java.util.List;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
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
  private final boolean outOfOrder;
  private final boolean validateOnMigrate;
  private final boolean cleanDisabled;
  private final boolean baselineOnMigrate;
  private final int connectRetries;
  private final int connectRetriesInterval;
  private final int lockRetryCount;
  private final String schemas;
  private final String defaultSchema;

  public FlywayConfig(final Environment environment, final String locations) {
    this(
      environment,
      locations,
      true,
      true,
      true,
      false,
      10,
      5,
      50,
      "nivo,public",
      "nivo");
  }

  @Autowired
  public FlywayConfig(
    final Environment environment,
    @Value("${spring.flyway.locations:classpath:db/migration}") final String locations,
    @Value("${spring.flyway.out-of-order:true}") final boolean outOfOrder,
    @Value("${spring.flyway.validate-on-migrate:true}") final boolean validateOnMigrate,
    @Value("${spring.flyway.clean-disabled:true}") final boolean cleanDisabled,
    @Value("${spring.flyway.baseline-on-migrate:false}") final boolean baselineOnMigrate,
    @Value("${spring.flyway.connect-retries:10}") final int connectRetries,
    @Value("${spring.flyway.connect-retries-interval:5}") final int connectRetriesInterval,
    @Value("${spring.flyway.lock-retry-count:50}") final int lockRetryCount,
    @Value("${spring.flyway.schemas:nivo,public}") final String schemas,
    @Value("${spring.flyway.default-schema:nivo}") final String defaultSchema) {
    this.environment = environment;
    this.locations = locations;
    this.outOfOrder = outOfOrder;
    this.validateOnMigrate = validateOnMigrate;
    this.cleanDisabled = cleanDisabled;
    this.baselineOnMigrate = baselineOnMigrate;
    this.connectRetries = connectRetries;
    this.connectRetriesInterval = connectRetriesInterval;
    this.lockRetryCount = lockRetryCount;
    this.schemas = schemas;
    this.defaultSchema = defaultSchema;
  }

  @Bean(initMethod = "migrate")
  public Flyway flyway(final DataSource dataSource) {
    final String[] effectiveLocations = resolveEffectiveLocations();
    final String[] effectiveSchemas = Arrays.stream(schemas.split(","))
      .map(String::trim)
      .filter(schema -> !schema.isEmpty())
      .toArray(String[]::new);

    return Flyway.configure()
      .dataSource(dataSource)
      .schemas(effectiveSchemas)
      .defaultSchema(defaultSchema)
      .createSchemas(true)
      .locations(effectiveLocations)
      .outOfOrder(outOfOrder)
      .validateOnMigrate(validateOnMigrate)
      .cleanDisabled(cleanDisabled)
      .baselineOnMigrate(baselineOnMigrate)
      .connectRetries(connectRetries)
      .connectRetriesInterval(connectRetriesInterval)
      .lockRetryCount(lockRetryCount)
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

  public boolean isOutOfOrder() {
    return outOfOrder;
  }

  public boolean isValidateOnMigrate() {
    return validateOnMigrate;
  }

  public boolean isCleanDisabled() {
    return cleanDisabled;
  }

  public boolean isBaselineOnMigrate() {
    return baselineOnMigrate;
  }

  public int getConnectRetries() {
    return connectRetries;
  }

  public int getConnectRetriesInterval() {
    return connectRetriesInterval;
  }

  public int getLockRetryCount() {
    return lockRetryCount;
  }

  public String getSchemas() {
    return schemas;
  }

  public String getDefaultSchema() {
    return defaultSchema;
  }
}
