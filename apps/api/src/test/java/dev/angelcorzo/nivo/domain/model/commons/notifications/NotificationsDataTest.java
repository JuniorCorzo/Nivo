package dev.angelcorzo.nivo.domain.model.commons.notifications;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("NotificationsData Unit Tests")
class NotificationsDataTest {

  private record TestNotificationData(
    String companyName,
    String supportUrl,
    String socialUrl,
    String unsubscribeUrl,
    String companyAddress,
    String extraField) implements NotificationsData {
  }

  @Test
  @DisplayName("Should convert record components to map cleanly")
  void shouldConvertToMap() {
    final TestNotificationData data = new TestNotificationData(
      "Nivo Inc",
      "https://support.nivo.dev",
      "https://social.nivo.dev",
      "https://unsub.nivo.dev",
      "Street 123",
      "Custom Value");

    final Map<String, String> map = data.toMap();

    assertThat(map)
      .containsEntry("companyName", "Nivo Inc")
      .containsEntry("supportUrl", "https://support.nivo.dev")
      .containsEntry("extraField", "Custom Value");
  }

  @Test
  @DisplayName("Should handle null values by storing string 'null'")
  void shouldHandleNullValues() {
    final TestNotificationData data = new TestNotificationData(
      "Nivo Inc",
      null,
      null,
      null,
      null,
      null);

    final Map<String, String> map = data.toMap();

    assertThat(map)
      .containsEntry("companyName", "Nivo Inc")
      .containsEntry("supportUrl", "null");
  }

  @Test
  @DisplayName("Should return empty map when not implemented as a record")
  void shouldReturnEmptyMapForNonRecord() {
    final NotificationsData nonRecord = new NotificationsData() {
      @Override
      public String companyName() {
        return "Nivo";
      }

      @Override
      public String supportUrl() {
        return null;
      }

      @Override
      public String socialUrl() {
        return null;
      }

      @Override
      public String unsubscribeUrl() {
        return null;
      }

      @Override
      public String companyAddress() {
        return null;
      }
    };

    final Map<String, String> map = nonRecord.toMap();

    assertThat(map).isEmpty();
  }
}
