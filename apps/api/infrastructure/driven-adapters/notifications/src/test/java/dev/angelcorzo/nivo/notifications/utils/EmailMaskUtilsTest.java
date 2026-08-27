package dev.angelcorzo.nivo.notifications.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("EmailMaskUtils Unit Tests")
class EmailMaskUtilsTest {

  @Test
  @DisplayName("Should mask valid email properly")
  void shouldMaskValidEmail() {
    assertThat(EmailMaskUtils.mask("john.doe@example.com")).isEqualTo("j***@example.com");
    assertThat(EmailMaskUtils.mask("a@b.com")).isEqualTo("a***@b.com");
  }

  @ParameterizedTest
  @NullAndEmptySource
  @ValueSource(strings = {"   ", "invalid", "invalid@", "@invalid"})
  @DisplayName("Should return *** for invalid or blank emails")
  void shouldReturnStarsForInvalid(String input) {
    assertThat(EmailMaskUtils.mask(input)).isEqualTo("***");
  }
}
