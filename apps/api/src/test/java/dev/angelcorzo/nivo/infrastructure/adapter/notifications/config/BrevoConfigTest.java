package dev.angelcorzo.nivo.infrastructure.adapter.notifications.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class BrevoConfigTest {

  private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
      .withConfiguration(AutoConfigurations.of(ConfigurationPropertiesAutoConfiguration.class))
      .withUserConfiguration(BrevoProperties.class, BrevoConfig.class);

  @Test
  @DisplayName("BrevoProperties should have default values")
  void shouldHaveDefaultValues() {
    final BrevoProperties properties = new BrevoProperties();

    assertThat(properties.getApiKey()).isEqualTo("xkeysib-dev-key");
    assertThat(properties.getUrl()).isEqualTo("https://api.brevo.com/v3");
    assertThat(properties.getSenderName()).isEqualTo("Nivo");
    assertThat(properties.getSenderEmail()).isEqualTo("noreply@nivo.dev");
    assertThat(properties.getConnectTimeout()).isEqualTo(5000);
    assertThat(properties.getReadTimeout()).isEqualTo(10000);
  }

  @Test
  @DisplayName("BrevoProperties should allow custom values")
  void shouldAllowCustomValues() {
    final BrevoProperties properties = new BrevoProperties();
    properties.setApiKey("custom-api-key");
    properties.setUrl("https://custom.brevo.com/v3");
    properties.setSenderName("Custom Sender");
    properties.setSenderEmail("custom@nivo.dev");
    properties.setConnectTimeout(3000);
    properties.setReadTimeout(7000);

    assertThat(properties.getApiKey()).isEqualTo("custom-api-key");
    assertThat(properties.getUrl()).isEqualTo("https://custom.brevo.com/v3");
    assertThat(properties.getSenderName()).isEqualTo("Custom Sender");
    assertThat(properties.getSenderEmail()).isEqualTo("custom@nivo.dev");
    assertThat(properties.getConnectTimeout()).isEqualTo(3000);
    assertThat(properties.getReadTimeout()).isEqualTo(7000);
  }

  @Test
  @DisplayName("brevoRestClient should be created and configured with base URL and default headers")
  void shouldCreateAndConfigureBrevoRestClient() {
    final BrevoProperties properties = new BrevoProperties();
    properties.setApiKey("test-key-123");
    properties.setUrl("https://api.brevo.com/v3");

    final BrevoConfig config = new BrevoConfig(properties);
    final RestClient restClient = config.brevoRestClient();

    assertThat(restClient).isNotNull();

    final RestClient.Builder builder = restClient.mutate();
    final MockRestServiceServer mockServer = MockRestServiceServer.bindTo(builder).build();
    final RestClient testClient = builder.build();

    mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
        .andExpect(header("api-key", "test-key-123"))
        .andExpect(header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE))
        .andExpect(header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE))
        .andRespond(withSuccess("{\"messageId\":\"1\"}", MediaType.APPLICATION_JSON));

    final String response = testClient.post()
        .uri("/smtp/email")
        .contentType(MediaType.APPLICATION_JSON)
        .body("{\"to\":[{\"email\":\"test@example.com\"}]}")
        .retrieve()
        .body(String.class);

    assertThat(response).contains("messageId");
    mockServer.verify();
  }

  @Test
  @DisplayName("Application context should wire BrevoProperties and brevoRestClient bean")
  void shouldWireBeansInApplicationContext() {
    this.contextRunner
        .withPropertyValues(
            "nivo.notification.email.brevo.api-key=ctx-key",
            "nivo.notification.email.brevo.url=https://ctx.brevo.com/v3",
            "nivo.notification.email.brevo.sender-name=ContextSender",
            "nivo.notification.email.brevo.sender-email=ctx@nivo.dev",
            "nivo.notification.email.brevo.connect-timeout=2500",
            "nivo.notification.email.brevo.read-timeout=4500"
        )
        .run(context -> {
          assertThat(context).hasBean("brevoProperties");
          assertThat(context).hasBean("brevoRestClient");

          final BrevoProperties properties = context.getBean(BrevoProperties.class);
          assertThat(properties.getApiKey()).isEqualTo("ctx-key");
          assertThat(properties.getUrl()).isEqualTo("https://ctx.brevo.com/v3");
          assertThat(properties.getSenderName()).isEqualTo("ContextSender");
          assertThat(properties.getSenderEmail()).isEqualTo("ctx@nivo.dev");
          assertThat(properties.getConnectTimeout()).isEqualTo(2500);
          assertThat(properties.getReadTimeout()).isEqualTo(4500);

          final RestClient restClient = context.getBean("brevoRestClient", RestClient.class);
          assertThat(restClient).isNotNull();
        });
  }
}
