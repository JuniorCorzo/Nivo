package dev.angelcorzo.nivo.infrastructure.adapter.notifications.adapters;

import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import dev.angelcorzo.nivo.domain.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.clients.EmailProviderClient;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.enums.EmailProviderType;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.exceptions.SendGridApiException;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.exceptions.SendGridRequestBuildException;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.factories.SendGridMailFactory;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.services.NotificationsLoggerService;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.utils.EmailMaskUtils;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.utils.SendGridErrorMessageFormatter;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * SendGrid implementation of {@link EmailProviderClient} for EMAIL channel delivery.
 *
 * <p>
 * This adapter handles the full lifecycle of sending a transactional email via the SendGrid API: building the request
 * from a dynamic template, dispatching it, and registering the outcome (success or failure) in the notification logs.
 *
 * <p>
 * <strong>Channel coverage:</strong> EMAIL only.
 *
 * <p>
 * <strong>Layer:</strong> Infrastructure (Driven Adapter - Notifications Client)
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see EmailProviderClient
 * @see SendGridMailFactory
 * @see NotificationsLoggerService
 */
@Component
@Scope("singleton")
@RequiredArgsConstructor
@Slf4j
public class SendGridNotificationAdapter implements EmailProviderClient {

    private final SendGrid sendGrid;
    private final SendGridMailFactory sendGridMailFactory;
    private final NotificationsLoggerService notificationsLoggerService;
    private final SendGridErrorMessageFormatter sendGridErrorMessageFormatter;

    @Override
    public EmailProviderType getProviderType() {
        return EmailProviderType.SENDGRID;
    }

    /**
     * Sends a transactional email via the SendGrid API using a dynamic template.
     *
     * <p>
     * The flow is:
     * <ol>
     * <li>Build a {@link Mail} object from the template reference and notification content.</li>
     * <li>Serialize it into a {@link Request} and dispatch it to the SendGrid API.</li>
     * <li>On success (2xx), register a {@code SENT} log entry.</li>
     * <li>On non-2xx response, register a {@code FAILED} log entry and throw {@link SendGridApiException}.</li>
     * <li>On IO failure, register a {@code FAILED} log entry and throw {@link SendGridRequestBuildException}.</li>
     * </ol>
     *
     * @param template
     *            The {@link NotificationTemplates} that carries the SendGrid template reference and channel metadata.
     * @param to
     *            The recipient email address (used as the primary contact identifier for both EMAIL and WHATSAPP
     *            channels in this domain).
     * @param content
     *            The {@link NotificationsData} payload whose fields are injected as dynamic template variables.
     * @throws SendGridApiException
     *             if SendGrid returns a non-2xx HTTP status.
     * @throws SendGridRequestBuildException
     *             if the request cannot be serialized or an IO error occurs during the API call.
     */
    @Override
    public void sendEmail(final NotificationTemplates template, final String to, final NotificationsData content) {
        final String maskedTo = EmailMaskUtils.mask(to);
        log.info("Building email request. to={}, templateReference={}", maskedTo, template.getTemplateReference());

        final Mail mail = sendGridMailFactory.buildMail(template, to, content);
        final Request request = sendGridMailFactory.buildRequest(mail);

        log.debug("Calling SendGrid API for to={}", maskedTo);

        try {
            final Response response = sendGrid.api(request);
            final int statusCode = response.getStatusCode();
            final boolean isSuccessful = statusCode >= 200 && statusCode < 300;

            if (!isSuccessful) {
                final String providerError = this.sendGridErrorMessageFormatter.formatProviderError(statusCode,
                    response.getBody());

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
