package dev.angelcorzo.nivo.infrastructure.adapter.notifications.clients;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import dev.angelcorzo.nivo.domain.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.config.BrevoProperties;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.enums.EmailProviderType;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.exceptions.NotificationDeliveryException;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.formatters.HtmlNotificationBuilder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

@ExtendWith(MockitoExtension.class)
class BrevoEmailProviderClientTest {

  @Mock
  private HtmlNotificationBuilder htmlNotificationBuilder;

  private BrevoProperties brevoProperties;
  private MockRestServiceServer mockServer;
  private BrevoEmailProviderClient client;

  record TestNotificationData(
    String companyName,
    String supportUrl,
    String socialUrl,
    String unsubscribeUrl,
    String companyAddress,
    String username) implements NotificationsData {
  }

  @BeforeEach
  void setUp() {
    brevoProperties = new BrevoProperties();
    brevoProperties.setApiKey("test-api-key");
    brevoProperties.setUrl("https://api.brevo.com/v3");
    brevoProperties.setSenderName("Nivo Platform");
    brevoProperties.setSenderEmail("no-reply@nivo.dev");

    final RestClient.Builder restClientBuilder = RestClient.builder()
      .baseUrl(brevoProperties.getUrl())
      .defaultHeader("api-key", brevoProperties.getApiKey())
      .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
      .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

    mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
    final RestClient restClient = restClientBuilder.build();

    client = new BrevoEmailProviderClient(restClient, brevoProperties, htmlNotificationBuilder);
  }

  @Test
  @DisplayName("getProviderType should return EmailProviderType.BREVO")
  void shouldReturnBrevoProviderType() {
    assertThat(client.getProviderType()).isEqualTo(EmailProviderType.BREVO);
  }

  @Test
  @DisplayName("sendEmail should successfully post transactional email payload to Brevo /smtp/email")
  void shouldSendEmailSuccessfully() {
    final NotificationTemplates template = NotificationTemplates.builder()
      .name("Welcome to Nivo")
      .build();
    final NotificationsData data = new TestNotificationData(
      "Nivo", "https://nivo.dev/support", "https://twitter.com/nivo",
      "https://nivo.dev/unsub", "123 Tech St", "john_doe");

    when(htmlNotificationBuilder.buildSubject(template, data)).thenReturn("Welcome to Nivo");
    when(htmlNotificationBuilder.buildHtml(template, data))
      .thenReturn("<html><body>Hello john_doe</body></html>");

    mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
      .andExpect(method(HttpMethod.POST))
      .andExpect(header("api-key", "test-api-key"))
      .andExpect(header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE))
      .andExpect(header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE))
      .andExpect(content().json("""
        {
          "sender": {
            "name": "Nivo Platform",
            "email": "no-reply@nivo.dev"
          },
          "to": [
            {
              "email": "user@example.com"
            }
          ],
          "subject": "Welcome to Nivo",
          "htmlContent": "<html><body>Hello john_doe</body></html>"
        }
        """))
      .andRespond(
        withStatus(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON).body("{\"messageId\":\"<msg-123>\"}"));

    client.sendEmail(template, "user@example.com", data);

    mockServer.verify();
  }

  @Test
  @DisplayName("sendEmail should translate 400 Bad Request to non-retryable NotificationDeliveryException")
  void shouldTranslateBadRequestToNonRetryableException() {
    final NotificationTemplates template = NotificationTemplates.builder().build();
    final NotificationsData data = new TestNotificationData(
      "Nivo", "support", "social", "unsub", "addr", "user");

    when(htmlNotificationBuilder.buildSubject(any(), any())).thenReturn("Subject");
    when(htmlNotificationBuilder.buildHtml(any(), any())).thenReturn("<p>Body</p>");

    mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
      .andExpect(method(HttpMethod.POST))
      .andRespond(withBadRequest()
        .contentType(MediaType.APPLICATION_JSON)
        .body("{\"code\":\"invalid_parameter\",\"message\":\"Invalid email address\"}"));

    assertThatThrownBy(() -> client.sendEmail(template, "invalid-email", data))
      .isInstanceOf(NotificationDeliveryException.class)
      .satisfies(ex -> {
        final NotificationDeliveryException nde = (NotificationDeliveryException) ex;
        assertThat(nde.getStatusCode()).isEqualTo(400);
        assertThat(nde.getProviderName()).isEqualTo("BREVO");
        assertThat(nde.isRetryable()).isFalse();
        assertThat(nde.getMessage()).contains("Brevo API error 400");
        assertThat(nde.getMessage()).contains("invalid_parameter");
      });

    mockServer.verify();
  }

  @Test
  @DisplayName("sendEmail should translate 429 Too Many Requests to retryable NotificationDeliveryException")
  void shouldTranslateRateLimitToRetryableException() {
    final NotificationTemplates template = NotificationTemplates.builder().build();
    final NotificationsData data = new TestNotificationData(
      "Nivo", "support", "social", "unsub", "addr", "user");

    when(htmlNotificationBuilder.buildSubject(any(), any())).thenReturn("Subject");
    when(htmlNotificationBuilder.buildHtml(any(), any())).thenReturn("<p>Body</p>");

    mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
      .andExpect(method(HttpMethod.POST))
      .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS)
        .contentType(MediaType.APPLICATION_JSON)
        .body("{\"code\":\"too_many_requests\",\"message\":\"Rate limit exceeded\"}"));

    assertThatThrownBy(() -> client.sendEmail(template, "user@example.com", data))
      .isInstanceOf(NotificationDeliveryException.class)
      .satisfies(ex -> {
        final NotificationDeliveryException nde = (NotificationDeliveryException) ex;
        assertThat(nde.getStatusCode()).isEqualTo(429);
        assertThat(nde.getProviderName()).isEqualTo("BREVO");
        assertThat(nde.isRetryable()).isTrue();
        assertThat(nde.getMessage()).contains("Brevo API error 429");
      });

    mockServer.verify();
  }

  @Test
  @DisplayName("sendEmail should translate 500 Internal Server Error to retryable NotificationDeliveryException")
  void shouldTranslateServerErrorToRetryableException() {
    final NotificationTemplates template = NotificationTemplates.builder().build();
    final NotificationsData data = new TestNotificationData(
      "Nivo", "support", "social", "unsub", "addr", "user");

    when(htmlNotificationBuilder.buildSubject(any(), any())).thenReturn("Subject");
    when(htmlNotificationBuilder.buildHtml(any(), any())).thenReturn("<p>Body</p>");

    mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
      .andExpect(method(HttpMethod.POST))
      .andRespond(withServerError()
        .contentType(MediaType.APPLICATION_JSON)
        .body("{\"code\":\"server_error\",\"message\":\"Internal server error\"}"));

    assertThatThrownBy(() -> client.sendEmail(template, "user@example.com", data))
      .isInstanceOf(NotificationDeliveryException.class)
      .satisfies(ex -> {
        final NotificationDeliveryException nde = (NotificationDeliveryException) ex;
        assertThat(nde.getStatusCode()).isEqualTo(500);
        assertThat(nde.getProviderName()).isEqualTo("BREVO");
        assertThat(nde.isRetryable()).isTrue();
        assertThat(nde.getMessage()).contains("Brevo API error 500");
      });

    mockServer.verify();
  }

  @Test
  @DisplayName("sendEmail should translate transport/connection failure to retryable NotificationDeliveryException")
  void shouldTranslateTransportErrorToRetryableException() {
    final NotificationTemplates template = NotificationTemplates.builder().build();
    final NotificationsData data = new TestNotificationData(
      "Nivo", "support", "social", "unsub", "addr", "user");

    when(htmlNotificationBuilder.buildSubject(any(), any())).thenReturn("Subject");
    when(htmlNotificationBuilder.buildHtml(any(), any())).thenReturn("<p>Body</p>");

    final RestClient mockRestClient = org.mockito.Mockito.mock(RestClient.class);
    final RestClient.RequestBodyUriSpec bodyUriSpec = org.mockito.Mockito.mock(RestClient.RequestBodyUriSpec.class);
    final RestClient.RequestBodySpec bodySpec = org.mockito.Mockito.mock(RestClient.RequestBodySpec.class);
    final RestClient.ResponseSpec responseSpec = org.mockito.Mockito.mock(RestClient.ResponseSpec.class);

    when(mockRestClient.post()).thenReturn(bodyUriSpec);
    when(bodyUriSpec.uri("/smtp/email")).thenReturn(bodySpec);
    when(bodySpec.body(any(Object.class))).thenReturn(bodySpec);
    when(bodySpec.retrieve()).thenReturn(responseSpec);
    when(responseSpec.toBodilessEntity()).thenThrow(new ResourceAccessException("Connection timed out"));

    final BrevoEmailProviderClient clientWithMock = new BrevoEmailProviderClient(mockRestClient, brevoProperties,
      htmlNotificationBuilder);

    assertThatThrownBy(() -> clientWithMock.sendEmail(template, "user@example.com", data))
      .isInstanceOf(NotificationDeliveryException.class)
      .satisfies(ex -> {
        final NotificationDeliveryException nde = (NotificationDeliveryException) ex;
        assertThat(nde.getStatusCode()).isEqualTo(500);
        assertThat(nde.getProviderName()).isEqualTo("BREVO");
        assertThat(nde.isRetryable()).isTrue();
        assertThat(nde.getMessage()).contains("Brevo transport error: Connection timed out");
      });
  }

  @Test
  @DisplayName("sendEmail should parse combined RFC 822 sender email and extract name and email")
  void shouldParseCombinedSenderRfc822Format() {
    brevoProperties.setSenderEmail("Nivo<notifications@nivo.angelcorzo.dev>");
    brevoProperties.setSenderName("Default Name");

    final NotificationTemplates template = NotificationTemplates.builder().build();
    final NotificationsData data = new TestNotificationData(
      "Nivo", "support", "social", "unsub", "addr", "user");

    when(htmlNotificationBuilder.buildSubject(any(), any())).thenReturn("Subject");
    when(htmlNotificationBuilder.buildHtml(any(), any())).thenReturn("<p>Body</p>");

    mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
      .andExpect(method(HttpMethod.POST))
      .andExpect(content().json("""
        {
          "sender": {
            "name": "Nivo",
            "email": "notifications@nivo.angelcorzo.dev"
          },
          "to": [
            {
              "email": "user@example.com"
            }
          ]
        }
        """))
      .andRespond(withStatus(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON).body("{}"));

    client.sendEmail(template, "user@example.com", data);
    mockServer.verify();
  }

  @Test
  @DisplayName("sendEmail should parse recipient with display name and email")
  void shouldParseRecipientWithRfc822Format() {
    final NotificationTemplates template = NotificationTemplates.builder().build();
    final NotificationsData data = new TestNotificationData(
      "Nivo", "support", "social", "unsub", "addr", "user");

    when(htmlNotificationBuilder.buildSubject(any(), any())).thenReturn("Subject");
    when(htmlNotificationBuilder.buildHtml(any(), any())).thenReturn("<p>Body</p>");

    mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
      .andExpect(method(HttpMethod.POST))
      .andExpect(content().json("""
        {
          "sender": {
            "name": "Nivo Platform",
            "email": "no-reply@nivo.dev"
          },
          "to": [
            {
              "name": "Jane Doe",
              "email": "jane@example.com"
            }
          ]
        }
        """))
      .andRespond(withStatus(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON).body("{}"));

    client.sendEmail(template, "Jane Doe <jane@example.com>", data);
    mockServer.verify();
  }
}
