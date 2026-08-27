package dev.angelcorzo.nivo.notifications.factories;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.sendgrid.Request;
import com.sendgrid.helpers.mail.Mail;
import dev.angelcorzo.nivo.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.commons.notifications.valueobjects.UserInvitedData;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.notifications.config.SendGridProperties;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("SendGridMailFactory Unit Tests")
class SendGridMailFactoryTest {

  @Mock private SendGridProperties sendGridProperties;

  @InjectMocks private SendGridMailFactory factory;

  private NotificationTemplates template;
  private NotificationsData content;

  @BeforeEach
  void setUp() {
    template =
        NotificationTemplates.builder()
            .id(UUID.randomUUID())
            .templateReference("d-123456789")
            .eventType(NotificationEvents.USER_INVITED)
            .channel(NotificationsChannel.EMAIL)
            .build();

    content = UserInvitedData.builder().userName("John Doe").build();
  }

  @Test
  @DisplayName("Should build Mail object correctly")
  void shouldBuildMail() {
    when(sendGridProperties.getFromEmail()).thenReturn("noreply@nivo.dev");

    Mail mail = factory.buildMail(template, "john@example.com", content);

    assertThat(mail).isNotNull();
    assertThat(mail.getFrom().getEmail()).isEqualTo("noreply@nivo.dev");
    assertThat(mail.getTemplateId()).isEqualTo("d-123456789");
  }

  @Test
  @DisplayName("Should build Request object correctly from Mail")
  void shouldBuildRequest() {
    when(sendGridProperties.getFromEmail()).thenReturn("noreply@nivo.dev");

    Mail mail = factory.buildMail(template, "john@example.com", content);
    Request request = factory.buildRequest(mail);

    assertThat(request).isNotNull();
    assertThat(request.getEndpoint()).isEqualTo("mail/send");
    assertThat(request.getBody()).isNotBlank();
  }
}
