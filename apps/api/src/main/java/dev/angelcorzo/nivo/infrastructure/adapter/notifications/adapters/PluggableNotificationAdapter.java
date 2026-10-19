package dev.angelcorzo.nivo.infrastructure.adapter.notifications.adapters;

import dev.angelcorzo.nivo.domain.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.domain.model.commons.notifications.gateway.NotificationGateway;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.clients.EmailProviderClient;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.enums.EmailProviderType;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Pluggable {@link NotificationGateway} implementation that dynamically routes email dispatches
 * to the configured {@link EmailProviderClient} strategy (SendGrid, Resend, Brevo, or Mock).
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - Pluggable Notification Dispatcher)
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
@Primary
@Component
@Slf4j
public class PluggableNotificationAdapter implements NotificationGateway {

  private final Map<EmailProviderType, EmailProviderClient> clientsByProvider;
  private final EmailProviderType activeProvider;

  public PluggableNotificationAdapter(
      final List<EmailProviderClient> clients,
      @Value("${nivo.notification.email.provider:SENDGRID}") final String activeProviderName) {
    this.clientsByProvider = new EnumMap<>(EmailProviderType.class);
    for (EmailProviderClient client : clients) {
      this.clientsByProvider.put(client.getProviderType(), client);
    }
    this.activeProvider = resolveProviderType(activeProviderName);
    log.info(
        "Initialized PluggableNotificationAdapter with active email provider: {} (registered providers: {})",
        this.activeProvider,
        this.clientsByProvider.keySet());
  }

  @Override
  public void sendEmail(
      final NotificationTemplates template,
      final String to,
      final NotificationsData content) {
    final EmailProviderClient client = this.clientsByProvider.get(this.activeProvider);
    if (client == null) {
      throw new IllegalStateException(
          "No EmailProviderClient registered for active provider: " + this.activeProvider);
    }

    log.debug(
        "Delegating email dispatch to provider={} for template={}",
        this.activeProvider,
        template != null ? template.getTemplateReference() : "N/A");

    client.sendEmail(template, to, content);
  }

  public EmailProviderType getActiveProvider() {
    return this.activeProvider;
  }

  private static EmailProviderType resolveProviderType(final String providerName) {
    if (providerName == null || providerName.isBlank()) {
      return EmailProviderType.SENDGRID;
    }
    try {
      return EmailProviderType.valueOf(providerName.trim().toUpperCase());
    } catch (IllegalArgumentException e) {
      log.warn(
          "Unknown email provider '{}' configured; falling back to default SENDGRID",
          providerName);
      return EmailProviderType.SENDGRID;
    }
  }
}
