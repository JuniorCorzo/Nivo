package dev.angelcorzo.nivo.infrastructure.adapter.jpa.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

@ExtendWith(MockitoExtension.class)
class FlywayConfigTest {

  @Mock
  private Environment environment;

  @Test
  @DisplayName("Should include seeds location when 'dev' profile is active")
  void shouldIncludeSeedsWhenDevProfileIsActive() {
    when(environment.getActiveProfiles()).thenReturn(new String[]{"dev"});
    final String locations = "classpath:db/migration,classpath:db/seeds";
    final FlywayConfig flywayConfig = new FlywayConfig(environment, locations);

    final String[] effectiveLocations = flywayConfig.resolveEffectiveLocations();

    assertThat(effectiveLocations).containsExactly("classpath:db/migration", "classpath:db/seeds");
  }

  @Test
  @DisplayName("Should include seeds location when 'local' profile is active")
  void shouldIncludeSeedsWhenLocalProfileIsActive() {
    when(environment.getActiveProfiles()).thenReturn(new String[]{"local"});
    final String locations = "classpath:db/migration,classpath:db/seeds";
    final FlywayConfig flywayConfig = new FlywayConfig(environment, locations);

    final String[] effectiveLocations = flywayConfig.resolveEffectiveLocations();

    assertThat(effectiveLocations).containsExactly("classpath:db/migration", "classpath:db/seeds");
  }

  @Test
  @DisplayName("Should filter out seeds location when 'prod' profile is active")
  void shouldFilterOutSeedsWhenProdProfileIsActive() {
    when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});
    final String locations = "classpath:db/migration,classpath:db/seeds";
    final FlywayConfig flywayConfig = new FlywayConfig(environment, locations);

    final String[] effectiveLocations = flywayConfig.resolveEffectiveLocations();

    assertThat(effectiveLocations).containsExactly("classpath:db/migration");
  }

  @Test
  @DisplayName("Should filter out seeds location when running without dev or local profile (e.g. test or default)")
  void shouldFilterOutSeedsWhenNoDevProfileIsActive() {
    when(environment.getActiveProfiles()).thenReturn(new String[]{"test"});
    final String locations = "classpath:db/migration,classpath:db/seeds";
    final FlywayConfig flywayConfig = new FlywayConfig(environment, locations);

    final String[] effectiveLocations = flywayConfig.resolveEffectiveLocations();

    assertThat(effectiveLocations).containsExactly("classpath:db/migration");
  }
}
