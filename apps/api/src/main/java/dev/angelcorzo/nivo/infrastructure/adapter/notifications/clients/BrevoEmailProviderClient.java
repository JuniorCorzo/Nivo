package dev.angelcorzo.nivo.infrastructure.adapter.notifications.clients;

import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import dev.angelcorzo.nivo.domain.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.config.BrevoProperties;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.enums.EmailProviderType;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.exceptions.NotificationDeliveryException;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.formatters.HtmlNotificationBuilder;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.utils.EmailAddressParser;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.utils.EmailAddressParser.ParsedEmailAddress;

/**
 * Brevo (formerly Sendinblue) transactional email delivery provider client.
 */
@Slf4j
@Component
public class BrevoEmailProviderClient implements EmailProviderClient {

  private static final String PROVIDER_NAME = "BREVO";
  private static final String SMTP_EMAIL_PATH = "/smtp/email";

  private final RestClient brevoRestClient;
  private final BrevoProperties brevoProperties;
  private final HtmlNotificationBuilder htmlNotificationBuilder;

  public BrevoEmailProviderClient(
    @Qualifier("brevoRestClient") final RestClient brevoRestClient,
    final BrevoProperties brevoProperties,
    final HtmlNotificationBuilder htmlNotificationBuilder) {
    this.brevoRestClient = brevoRestClient;
    this.brevoProperties = brevoProperties;
    this.htmlNotificationBuilder = htmlNotificationBuilder;
  }

  @Override
  public EmailProviderType getProviderType() {
    return EmailProviderType.BREVO;
  }

  @Override
  public void sendEmail(
    final NotificationTemplates template,
    final String to,
    final NotificationsData content) {
    final String subject = this.htmlNotificationBuilder.buildSubject(template, content);
    final String htmlContent = this.htmlNotificationBuilder.buildHtml(template, content);

    final ParsedEmailAddress parsedSender = EmailAddressParser.parse(this.brevoProperties.getSenderEmail());
    final String senderName = (parsedSender.name() != null && !parsedSender.name().isBlank())
      ? parsedSender.name()
      : this.brevoProperties.getSenderName();
    final String senderEmail = parsedSender.email();

    final ParsedEmailAddress parsedRecipient = EmailAddressParser.parse(to);
    final Map<String, Object> toMap = (parsedRecipient.name() != null && !parsedRecipient.name().isBlank())
      ? Map.of("email", parsedRecipient.email(), "name", parsedRecipient.name())
      : Map.of("email", parsedRecipient.email());

    final Map<String, Object> payload = Map.of(
      "sender", Map.of(
        "name", senderName,
        "email", senderEmail),
      "to", List.of(toMap),
      "subject", subject,
      "htmlContent", htmlContent);

    try {
      this.brevoRestClient.post()
        .uri(SMTP_EMAIL_PATH)
        .body(payload)
        .retrieve()
        .toBodilessEntity();
    } catch (final RestClientResponseException ex) {
      final int statusCode = ex.getStatusCode().value();
      final String responseBody = ex.getResponseBodyAsString();
      log.error("Brevo API responded with error status {}: {}", statusCode, responseBody, ex);
      throw new NotificationDeliveryException(
        statusCode,
        PROVIDER_NAME,
        "Brevo API error " + statusCode + ": " + responseBody,
        ex);
    } catch (final RestClientException ex) {
      log.error("Brevo transport error while sending email to {}: {}", to, ex.getMessage(), ex);
      throw new NotificationDeliveryException(
        500,
        PROVIDER_NAME,
        "Brevo transport error: " + ex.getMessage(),
        ex);
    }
  }
}
