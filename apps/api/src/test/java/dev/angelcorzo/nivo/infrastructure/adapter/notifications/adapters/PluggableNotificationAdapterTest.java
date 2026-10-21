package dev.angelcorzo.nivo.infrastructure.adapter.notifications.adapters;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.domain.model.commons.notifications.valueobjects.UserInvitedData;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.clients.EmailProviderClient;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.enums.EmailProviderType;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.services.NotificationsLoggerService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("PluggableNotificationAdapter Unit Tests")
class PluggableNotificationAdapterTest {

  @Mock private EmailProviderClient sendGridClient;
  @Mock private EmailProviderClient resendClient;
  @Mock private EmailProviderClient brevoClient;
  @Mock private NotificationsLoggerService notificationsLoggerService;

  private NotificationTemplates template;
  private NotificationsData content;
  private final String recipient = "user@example.com";

  @BeforeEach
  void setUp() {
    lenient().when(sendGridClient.getProviderType()).thenReturn(EmailProviderType.SENDGRID);
    lenient().when(resendClient.getProviderType()).thenReturn(EmailProviderType.RESEND);
    lenient().when(brevoClient.getProviderType()).thenReturn(EmailProviderType.BREVO);

    template =
        NotificationTemplates.builder()
            .id(UUID.randomUUID())
            .templateReference("tpl-123")
            .build();
    content = UserInvitedData.builder().userName("Tester").build();
  }

  @Test
  @DisplayName("Should delegate to SendGrid client and log success when provider is SENDGRID")
  void shouldDelegateToSendGridWhenConfiguredWithSendGrid() {
    final PluggableNotificationAdapter adapter =
        new PluggableNotificationAdapter(
            List.of(sendGridClient, resendClient, brevoClient),
            "SENDGRID",
            notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.SENDGRID);

    adapter.sendEmail(template, recipient, content);

    verify(sendGridClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
    verify(resendClient, never()).sendEmail(any(), any(), any());
    verify(brevoClient, never()).sendEmail(any(), any(), any());
  }

  @Test
  @DisplayName("Should delegate to Resend client and log success when provider is RESEND")
  void shouldDelegateToResendWhenConfiguredWithResend() {
    final PluggableNotificationAdapter adapter =
        new PluggableNotificationAdapter(
            List.of(sendGridClient, resendClient, brevoClient),
            "RESEND",
            notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.RESEND);

    adapter.sendEmail(template, recipient, content);

    verify(resendClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
    verify(sendGridClient, never()).sendEmail(any(), any(), any());
    verify(brevoClient, never()).sendEmail(any(), any(), any());
  }

  @Test
  @DisplayName("Should delegate to Brevo client and log success when provider is BREVO")
  void shouldDelegateToBrevoWhenConfiguredWithBrevo() {
    final PluggableNotificationAdapter adapter =
        new PluggableNotificationAdapter(
            List.of(sendGridClient, resendClient, brevoClient),
            "BREVO",
            notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.BREVO);

    adapter.sendEmail(template, recipient, content);

    verify(brevoClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
    verify(sendGridClient, never()).sendEmail(any(), any(), any());
    verify(resendClient, never()).sendEmail(any(), any(), any());
  }

  @Test
  @DisplayName("Should handle case-insensitive and trimmed provider names")
  void shouldHandleCaseInsensitiveProviderName() {
    final PluggableNotificationAdapter adapter =
        new PluggableNotificationAdapter(
            List.of(sendGridClient, resendClient, brevoClient),
            "  resend  ",
            notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.RESEND);

    adapter.sendEmail(template, recipient, content);

    verify(resendClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
  }

  @Test
  @DisplayName("Should fallback to SENDGRID when configured with unknown or blank provider name")
  void shouldFallbackToSendGridOnUnknownProvider() {
    final PluggableNotificationAdapter adapter =
        new PluggableNotificationAdapter(
            List.of(sendGridClient, resendClient, brevoClient),
            "UNKNOWN_PROVIDER",
            notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.SENDGRID);

    adapter.sendEmail(template, recipient, content);

    verify(sendGridClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
  }

  @Test
  @DisplayName("Should log error and rethrow when client throws exception")
  void shouldLogErrorAndRethrowWhenClientThrowsException() {
    final RuntimeException error = new RuntimeException("API connection timeout");
    doThrow(error).when(sendGridClient).sendEmail(template, recipient, content);

    final PluggableNotificationAdapter adapter =
        new PluggableNotificationAdapter(
            List.of(sendGridClient, resendClient, brevoClient),
            "SENDGRID",
            notificationsLoggerService);

    assertThatThrownBy(() -> adapter.sendEmail(template, recipient, content))
        .isSameAs(error);

    verify(notificationsLoggerService).registerLog(template, recipient, "API connection timeout");
    verify(notificationsLoggerService, never()).registerLog(template, recipient);
  }

  @Test
  @DisplayName("Should throw IllegalStateException when no client is registered for active provider")
  void shouldThrowIllegalStateExceptionWhenNoClientRegistered() {
    final PluggableNotificationAdapter adapter =
        new PluggableNotificationAdapter(
            List.of(sendGridClient),
            "RESEND",
            notificationsLoggerService);

    assertThatThrownBy(() -> adapter.sendEmail(template, recipient, content))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("No EmailProviderClient registered for active provider: RESEND");

    verifyNoInteractions(notificationsLoggerService);
  }
}
