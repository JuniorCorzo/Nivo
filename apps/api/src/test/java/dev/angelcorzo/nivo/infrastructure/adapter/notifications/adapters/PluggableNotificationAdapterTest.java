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

  @Mock
  private EmailProviderClient brevoClient;
  @Mock
  private EmailProviderClient mockClient;
  @Mock
  private NotificationsLoggerService notificationsLoggerService;

  private NotificationTemplates template;
  private NotificationsData content;
  private final String recipient = "user@example.com";

  @BeforeEach
  void setUp() {
    lenient().when(brevoClient.getProviderType()).thenReturn(EmailProviderType.BREVO);
    lenient().when(mockClient.getProviderType()).thenReturn(EmailProviderType.MOCK);

    template = NotificationTemplates.builder()
      .id(UUID.randomUUID())
      .templateReference("tpl-123")
      .build();
    content = UserInvitedData.builder().userName("Tester").build();
  }

  @Test
  @DisplayName("Should delegate to Brevo client and log success when provider is BREVO")
  void shouldDelegateToBrevoWhenConfiguredWithBrevo() {
    final PluggableNotificationAdapter adapter = new PluggableNotificationAdapter(
      List.of(brevoClient, mockClient),
      "BREVO",
      notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.BREVO);

    adapter.sendEmail(template, recipient, content);

    verify(brevoClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
    verify(mockClient, never()).sendEmail(any(), any(), any());
  }

  @Test
  @DisplayName("Should delegate to Brevo client by default when provider is null")
  void shouldDelegateToBrevoByDefaultWhenProviderIsNull() {
    final PluggableNotificationAdapter adapter = new PluggableNotificationAdapter(
      List.of(brevoClient, mockClient),
      null,
      notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.BREVO);

    adapter.sendEmail(template, recipient, content);

    verify(brevoClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
    verify(mockClient, never()).sendEmail(any(), any(), any());
  }

  @Test
  @DisplayName("Should delegate to Brevo client by default when provider is blank")
  void shouldDelegateToBrevoByDefaultWhenProviderIsBlank() {
    final PluggableNotificationAdapter adapter = new PluggableNotificationAdapter(
      List.of(brevoClient, mockClient),
      "   ",
      notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.BREVO);

    adapter.sendEmail(template, recipient, content);

    verify(brevoClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
    verify(mockClient, never()).sendEmail(any(), any(), any());
  }

  @Test
  @DisplayName("Should delegate to Mock client and log success when provider is MOCK")
  void shouldDelegateToMockWhenConfiguredWithMock() {
    final PluggableNotificationAdapter adapter = new PluggableNotificationAdapter(
      List.of(brevoClient, mockClient),
      "MOCK",
      notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.MOCK);

    adapter.sendEmail(template, recipient, content);

    verify(mockClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
    verify(brevoClient, never()).sendEmail(any(), any(), any());
  }

  @Test
  @DisplayName("Should handle case-insensitive and trimmed provider names")
  void shouldHandleCaseInsensitiveProviderName() {
    final PluggableNotificationAdapter adapter = new PluggableNotificationAdapter(
      List.of(brevoClient, mockClient),
      "  brevo  ",
      notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.BREVO);

    adapter.sendEmail(template, recipient, content);

    verify(brevoClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
  }

  @Test
  @DisplayName("Should fallback to BREVO when configured with unknown provider name")
  void shouldFallbackToBrevoOnUnknownProvider() {
    final PluggableNotificationAdapter adapter = new PluggableNotificationAdapter(
      List.of(brevoClient, mockClient),
      "UNKNOWN_PROVIDER",
      notificationsLoggerService);

    assertThat(adapter.getActiveProvider()).isEqualTo(EmailProviderType.BREVO);

    adapter.sendEmail(template, recipient, content);

    verify(brevoClient).sendEmail(template, recipient, content);
    verify(notificationsLoggerService).registerLog(template, recipient);
  }

  @Test
  @DisplayName("Should log error and rethrow when client throws exception")
  void shouldLogErrorAndRethrowWhenClientThrowsException() {
    final RuntimeException error = new RuntimeException("API connection timeout");
    doThrow(error).when(brevoClient).sendEmail(template, recipient, content);

    final PluggableNotificationAdapter adapter = new PluggableNotificationAdapter(
      List.of(brevoClient, mockClient),
      "BREVO",
      notificationsLoggerService);

    assertThatThrownBy(() -> adapter.sendEmail(template, recipient, content))
      .isSameAs(error);

    verify(notificationsLoggerService).registerLog(template, recipient, "API connection timeout");
    verify(notificationsLoggerService, never()).registerLog(template, recipient);
  }

  @Test
  @DisplayName("Should throw IllegalStateException when no client is registered for active provider")
  void shouldThrowIllegalStateExceptionWhenNoClientRegistered() {
    final PluggableNotificationAdapter adapter = new PluggableNotificationAdapter(
      List.of(brevoClient),
      "MOCK",
      notificationsLoggerService);

    assertThatThrownBy(() -> adapter.sendEmail(template, recipient, content))
      .isInstanceOf(IllegalStateException.class)
      .hasMessageContaining("No EmailProviderClient registered for active provider: MOCK");

    verifyNoInteractions(notificationsLoggerService);
  }
}
