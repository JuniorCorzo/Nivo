package dev.angelcorzo.nivo.infrastructure.adapter.notifications.clients;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.commons.notifications.valueobjects.UserInvitedData;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.enums.EmailProviderType;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ResendEmailProviderClient Unit Tests")
class ResendEmailProviderClientTest {

  @Test
  @DisplayName("Should return RESEND provider type and configured API key")
  void shouldReturnResendProviderTypeAndApiKey() {
    final ResendEmailProviderClient client = new ResendEmailProviderClient("re_123456");

    assertThat(client.getProviderType()).isEqualTo(EmailProviderType.RESEND);
    assertThat(client.getApiKey()).isEqualTo("re_123456");
  }

  @Test
  @DisplayName("Should build structured payload and dispatch email via Resend")
  void shouldBuildStructuredPayloadAndDispatch() {
    final ResendEmailProviderClient client = new ResendEmailProviderClient("re_123456");
    final NotificationTemplates template =
        NotificationTemplates.builder()
            .id(UUID.randomUUID())
            .templateReference("re_tpl_welcome")
            .build();
    final UserInvitedData data = UserInvitedData.builder().userName("Alice").build();

    final Map<String, Object> payload = client.buildRequestPayload(template, "alice@example.com", data);

    assertThat(payload.get("to")).isEqualTo(List.of("alice@example.com"));
    assertThat(payload.get("template_id")).isEqualTo("re_tpl_welcome");
    assertThat(payload.get("data")).isEqualTo(data);

    // Verify sendEmail executes without error
    client.sendEmail(template, "alice@example.com", data);
  }
}
