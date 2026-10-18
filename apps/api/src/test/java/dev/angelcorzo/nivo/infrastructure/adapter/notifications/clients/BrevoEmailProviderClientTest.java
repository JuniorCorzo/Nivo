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

@DisplayName("BrevoEmailProviderClient Unit Tests")
class BrevoEmailProviderClientTest {

  @Test
  @DisplayName("Should return BREVO provider type and configured API key")
  void shouldReturnBrevoProviderTypeAndApiKey() {
    final BrevoEmailProviderClient client = new BrevoEmailProviderClient("xkeysib-123456");

    assertThat(client.getProviderType()).isEqualTo(EmailProviderType.BREVO);
    assertThat(client.getApiKey()).isEqualTo("xkeysib-123456");
  }

  @Test
  @DisplayName("Should build structured payload and dispatch email via Brevo")
  void shouldBuildStructuredPayloadAndDispatch() {
    final BrevoEmailProviderClient client = new BrevoEmailProviderClient("xkeysib-123456");
    final NotificationTemplates template =
        NotificationTemplates.builder()
            .id(UUID.randomUUID())
            .templateReference("12")
            .build();
    final UserInvitedData data = UserInvitedData.builder().userName("Bob").build();

    final Map<String, Object> payload = client.buildRequestPayload(template, "bob@example.com", data);

    assertThat(payload.get("to")).isEqualTo(List.of(Map.of("email", "bob@example.com")));
    assertThat(payload.get("templateId")).isEqualTo("12");
    assertThat(payload.get("params")).isEqualTo(data);

    // Verify sendEmail executes without error
    client.sendEmail(template, "bob@example.com", data);
  }
}
