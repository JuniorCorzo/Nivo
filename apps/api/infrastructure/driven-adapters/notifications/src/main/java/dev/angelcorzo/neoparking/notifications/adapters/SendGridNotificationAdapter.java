package dev.angelcorzo.neoparking.notifications.adapters;

import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import dev.angelcorzo.neoparking.model.commons.notifications.NotificationsData;
import dev.angelcorzo.neoparking.model.commons.notifications.gateway.NotificationGateway;
import dev.angelcorzo.neoparking.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.neoparking.notifications.exceptions.SendGridApiException;
import dev.angelcorzo.neoparking.notifications.exceptions.SendGridRequestBuildException;
import dev.angelcorzo.neoparking.notifications.factories.SendGridMailFactory;
import dev.angelcorzo.neoparking.notifications.services.NotificationsLoggerService;
import dev.angelcorzo.neoparking.notifications.utils.EmailMaskUtils;
import dev.angelcorzo.neoparking.notifications.utils.SendGridErrorMessageFormatter;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * SendGrid implementation of the {@link NotificationGateway} for EMAIL channel delivery.
 *
 * <p>This adapter handles the full lifecycle of sending a transactional email via the SendGrid API:
 * building the request from a dynamic template, dispatching it, and registering the outcome
 * (success or failure) in the notification logs.
 *
 * <p><strong>Channel coverage:</strong> EMAIL only. The WHATSAPP channel is architecturally
 * reserved in {@link dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel}
 * but not yet implemented due to budget constraints. When WhatsApp support is added, a separate
 * adapter implementing {@link NotificationGateway} should be created (e.g., using Twilio or Meta
 * Cloud API) and a dispatch strategy introduced in
 * {@link dev.angelcorzo.neoparking.notifications.processors.NotificationProcessor}.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - Notifications)
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see NotificationGateway
 * @see SendGridMailFactory
 * @see NotificationsLoggerService
 */
@Component
@Scope("singleton")
@RequiredArgsConstructor
@Slf4j
public class SendGridNotificationAdapter implements NotificationGateway {

  private final SendGrid sendGrid;
  private final SendGridMailFactory sendGridMailFactory;
  private final NotificationsLoggerService notificationsLoggerService;
  private final SendGridErrorMessageFormatter sendGridErrorMessageFormatter;

  /**
   * Sends a transactional email via the SendGrid API using a dynamic template.
   *
   * <p>The flow is:
   * <ol>
   *   <li>Build a {@link Mail} object from the template reference and notification content.</li>
   *   <li>Serialize it into a {@link Request} and dispatch it to the SendGrid API.</li>
   *   <li>On success (2xx), register a {@code SENT} log entry.</li>
   *   <li>On non-2xx response, register a {@code FAILED} log entry and throw
   *       {@link SendGridApiException}.</li>
   *   <li>On IO failure, register a {@code FAILED} log entry and throw
   *       {@link SendGridRequestBuildException}.</li>
   * </ol>
   *
   * @param template The {@link NotificationTemplates} that carries the SendGrid template reference
   *                 and channel metadata.
   * @param to       The recipient email address (used as the primary contact identifier for both
   *                 EMAIL and WHATSAPP channels in this domain).
   * @param content  The {@link NotificationsData} payload whose fields are injected as dynamic
   *                 template variables.
   * @throws SendGridApiException          if SendGrid returns a non-2xx HTTP status.
   * @throws SendGridRequestBuildException if the request cannot be serialized or an IO error occurs
   *                                       during the API call.
   */
  @Override
  public void sendEmail(
      final NotificationTemplates template,
      final String to,
      final NotificationsData content) {
    final String maskedTo = EmailMaskUtils.mask(to);
    log.info(
        "Building email request. to={}, templateReference={}",
        maskedTo,
        template.getTemplateReference());

    final Mail mail = sendGridMailFactory.buildMail(template, to, content);
    final Request request = sendGridMailFactory.buildRequest(mail);

    log.debug("Calling SendGrid API for to={}", maskedTo);

    try {
      final Response response = sendGrid.api(request);
      final int statusCode = response.getStatusCode();
      final boolean isSuccessful = statusCode >= 200 && statusCode < 300;

      if (!isSuccessful) {
        final String providerError =
            this.sendGridErrorMessageFormatter.formatProviderError(statusCode, response.getBody());

        log.error("SendGrid rejected email to {}. {}", maskedTo, providerError);
        this.notificationsLoggerService.registerLog(template, to, providerError);
        throw new SendGridApiException(statusCode, response.getBody());
      }

      log.info("Email sent successfully to {}", maskedTo);
      this.notificationsLoggerService.registerLog(template, to);
    } catch (IOException e) {
      final String ioError = this.sendGridErrorMessageFormatter.formatIoError(e.getMessage());

      log.error("IO error while calling SendGrid API for to={}. {}", maskedTo, ioError, e);
      this.notificationsLoggerService.registerLog(template, to, ioError);
      throw new SendGridRequestBuildException("IO error while calling SendGrid API", e);
    }
  }
}
