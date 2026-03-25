package dev.angelcorzo.neoparking.notifications.factories;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import dev.angelcorzo.neoparking.model.commons.notifications.NotificationsData;
import dev.angelcorzo.neoparking.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.neoparking.notifications.config.SendGridProperties;
import dev.angelcorzo.neoparking.notifications.exceptions.SendGridRequestBuildException;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SendGridMailFactory {

  private static final String SEND_ENDPOINT = "mail/send";

  private final SendGridProperties sendGridProperties;

  /**
   * Builds a {@link Mail} object populated with the sender, dynamic template ID, recipient, and
   * dynamic template variables from the notification content.
   */
  public Mail buildMail(NotificationTemplates template, String to, NotificationsData content) {
    final Mail mail = new Mail();
    mail.setFrom(new Email(sendGridProperties.getFromEmail()));
    mail.setTemplateId(template.getTemplateReference());

    final Personalization personalization = new Personalization();
    personalization.addTo(new Email(to));
    content.toMap().forEach(personalization::addDynamicTemplateData);

    mail.addPersonalization(personalization);
    return mail;
  }

  /**
   * Serializes a {@link Mail} into a SendGrid {@link Request} ready to be dispatched.
   *
   * @throws SendGridRequestBuildException if the mail body cannot be serialized
   */
  public Request buildRequest(Mail mail) {
    final Request request = new Request();
    request.setMethod(Method.POST);
    request.setEndpoint(SEND_ENDPOINT);

    try {
      request.setBody(mail.build());
    } catch (IOException e) {
      throw new SendGridRequestBuildException("Failed to serialize mail body", e);
    }

    return request;
  }
}
