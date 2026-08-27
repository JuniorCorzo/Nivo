package dev.angelcorzo.nivo.notifications.adapters;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import dev.angelcorzo.nivo.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.commons.notifications.valueobjects.UserInvitedData;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.notifications.exceptions.SendGridApiException;
import dev.angelcorzo.nivo.notifications.exceptions.SendGridRequestBuildException;
import dev.angelcorzo.nivo.notifications.factories.SendGridMailFactory;
import dev.angelcorzo.nivo.notifications.services.NotificationsLoggerService;
import dev.angelcorzo.nivo.notifications.utils.SendGridErrorMessageFormatter;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("SendGridNotificationAdapter Unit Tests")
class SendGridNotificationAdapterTest {

  @Mock private SendGrid sendGrid;
  @Mock private SendGridMailFactory sendGridMailFactory;
  @Mock private NotificationsLoggerService notificationsLoggerService;
  @Mock private SendGridErrorMessageFormatter sendGridErrorMessageFormatter;

  @InjectMocks private SendGridNotificationAdapter adapter;

  private NotificationTemplates template;
  private NotificationsData content;
  private Mail mail;
  private Request request;

  @BeforeEach
  void setUp() {
    template =
        NotificationTemplates.builder()
            .id(UUID.randomUUID())
            .templateReference("d-12345")
            .eventType(NotificationEvents.USER_INVITED)
            .channel(NotificationsChannel.EMAIL)
            .build();

    content = UserInvitedData.builder().userName("John Doe").build();
    mail = new Mail();
    request = new Request();
  }

  @Test
  @DisplayName("Should send email successfully on 200 OK response")
  void shouldSendEmailSuccessfully() throws IOException {
    when(sendGridMailFactory.buildMail(template, "user@test.com", content)).thenReturn(mail);
    when(sendGridMailFactory.buildRequest(mail)).thenReturn(request);

    Response response = new Response(202, "Accepted", Map.of());
    when(sendGrid.api(request)).thenReturn(response);

    adapter.sendEmail(template, "user@test.com", content);

    verify(notificationsLoggerService).registerLog(template, "user@test.com");
  }

  @Test
  @DisplayName("Should log error and throw SendGridApiException on non-2xx response")
  void shouldThrowSendGridApiExceptionOnNon2xxResponse() throws IOException {
    when(sendGridMailFactory.buildMail(template, "user@test.com", content)).thenReturn(mail);
    when(sendGridMailFactory.buildRequest(mail)).thenReturn(request);

    Response response = new Response(400, "Bad Request", Map.of());
    when(sendGrid.api(request)).thenReturn(response);
    when(sendGridErrorMessageFormatter.formatProviderError(400, "Bad Request"))
        .thenReturn("Formatted Error");

    assertThatThrownBy(() -> adapter.sendEmail(template, "user@test.com", content))
        .isInstanceOf(SendGridApiException.class);

    verify(notificationsLoggerService).registerLog(template, "user@test.com", "Formatted Error");
  }

  @Test
  @DisplayName("Should log IO error and throw SendGridRequestBuildException on IOException")
  void shouldThrowSendGridRequestBuildExceptionOnIOException() throws IOException {
    when(sendGridMailFactory.buildMail(template, "user@test.com", content)).thenReturn(mail);
    when(sendGridMailFactory.buildRequest(mail)).thenReturn(request);

    when(sendGrid.api(request)).thenThrow(new IOException("Network error"));
    when(sendGridErrorMessageFormatter.formatIoError("Network error"))
        .thenReturn("Formatted IO Error");

    assertThatThrownBy(() -> adapter.sendEmail(template, "user@test.com", content))
        .isInstanceOf(SendGridRequestBuildException.class);

    verify(notificationsLoggerService).registerLog(template, "user@test.com", "Formatted IO Error");
  }
}
