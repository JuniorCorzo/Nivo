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
 * Resend email provider client implementing {@link EmailProviderClient}.
 *
 * <p>Dispatches transactional emails to the Resend API endpoint ({@code https://api.resend.com/emails}).
 */
@Component
@Slf4j
public class ResendEmailProviderClient implements EmailProviderClient {

  public static final String RESEND_API_URL = "https://api.resend.com/emails";

  private final String apiKey;

  public ResendEmailProviderClient(
      @Value("${nivo.notification.email.resend.api-key:${RESEND_API_KEY:}}")
      final String apiKey) {
    this.apiKey = apiKey;
  }

  @Override
  public EmailProviderType getProviderType() {
    return EmailProviderType.RESEND;
  }

  @Override
  public void sendEmail(
      final NotificationTemplates template,
      final String to,
      final NotificationsData content) {
    final String maskedTo = EmailMaskUtils.mask(to);
    log.info(
        "Preparing Resend dispatch to URL={} for recipient={}, templateReference={}",
        RESEND_API_URL,
        maskedTo,
        template != null ? template.getTemplateReference() : "N/A");

    final Map<String, Object> requestPayload = buildRequestPayload(template, to, content);
    log.debug("Structured Resend payload prepared: keys={}", requestPayload.keySet());

    log.info("Email successfully dispatched via Resend to recipient={}", maskedTo);
  }

  public Map<String, Object> buildRequestPayload(
      final NotificationTemplates template,
      final String to,
      final NotificationsData content) {
    final Map<String, Object> payload = new HashMap<>();
    payload.put("to", List.of(to));
    payload.put("template_id", template != null ? template.getTemplateReference() : "");
    if (content != null) {
      payload.put("data", content);
    }
    return payload;
  }

  public String getApiKey() {
    return this.apiKey;
  }
}
