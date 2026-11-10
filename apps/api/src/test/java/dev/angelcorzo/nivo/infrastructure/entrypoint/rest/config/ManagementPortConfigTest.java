package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.FileSystemResource;

@DisplayName("Management Port Configuration Tests")
class ManagementPortConfigTest {

  private final YamlPropertySourceLoader loader = new YamlPropertySourceLoader();

  @Test
  @DisplayName("In dev / base config (application.yaml), management.server.port must not be set so it binds to the single application port")
  void baseConfig_shouldNotDefineSeparateManagementPort() throws IOException {
    List<PropertySource<?>> sources = loader.load(
      "application.yaml",
      new FileSystemResource("src/main/resources/application.yaml"));
    assertThat(sources).isNotEmpty();

    PropertySource<?> source = sources.getFirst();
    assertThat(source.getProperty("management.server.port"))
      .as("management.server.port must not be configured in base/dev config to keep a single port")
      .isNull();
    assertThat(source.getProperty("management.server.address"))
      .as("management.server.address must not be configured in base/dev config")
      .isNull();
  }

  @Test
  @DisplayName("In production config (application-prod.yaml), management.server.port must be configured to split the management API")
  void prodConfig_shouldDefineSeparateManagementPort() throws IOException {
    List<PropertySource<?>> sources = loader.load(
      "application-prod.yaml",
      new FileSystemResource("src/main/resources/application-prod.yaml"));
    assertThat(sources).isNotEmpty();

    PropertySource<?> source = sources.getFirst();
    assertThat(source.getProperty("management.server.port"))
      .as("management.server.port must be configured in prod to isolate Actuator")
      .isEqualTo("${MANAGEMENT_PORT:8081}");
    assertThat(source.getProperty("management.server.address"))
      .as("management.server.address must be configured in prod")
      .isEqualTo("${MANAGEMENT_ADDRESS:0.0.0.0}");
  }
}
