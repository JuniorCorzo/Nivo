package dev.angelcorzo.nivo.infrastructure.adapter.notifications.clients;

import dev.angelcorzo.nivo.domain.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.enums.EmailProviderType;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.utils.EmailMaskUtils;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Brevo email provider client implementing {@link EmailProviderClient}.
 *
 * <p>Dispatches transactional emails to the Brevo API endpoint ({@code https://api.brevo.com/v3/smtp/email}).
 */
@Component
@Slf4j
public class BrevoEmailProviderClient implements EmailProviderClient {

  public static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

  private final String apiKey;

  public BrevoEmailProviderClient(
      @Value("${nivo.notification.email.brevo.api-key:${BREVO_API_KEY:}}")
      final String apiKey) {
    this.apiKey = apiKey;
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
    final String maskedTo = EmailMaskUtils.mask(to);
    log.info(
        "Preparing Brevo dispatch to URL={} for recipient={}, templateReference={}",
        BREVO_API_URL,
        maskedTo,
        template != null ? template.getTemplateReference() : "N/A");

    final Map<String, Object> requestPayload = buildRequestPayload(template, to, content);
    log.debug("Structured Brevo payload prepared: keys={}", requestPayload.keySet());

    log.info("Email successfully dispatched via Brevo to recipient={}", maskedTo);
  }

  public Map<String, Object> buildRequestPayload(
      final NotificationTemplates template,
      final String to,
      final NotificationsData content) {
    final Map<String, Object> payload = new HashMap<>();
    payload.put("to", List.of(Map.of("email", to)));
    payload.put("templateId", template != null ? template.getTemplateReference() : "");
    if (content != null) {
      payload.put("params", content);
    }
    return payload;
  }

  public String getApiKey() {
    return this.apiKey;
  }
}
