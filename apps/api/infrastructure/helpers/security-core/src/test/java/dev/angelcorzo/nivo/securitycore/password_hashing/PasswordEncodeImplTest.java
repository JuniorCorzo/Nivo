package dev.angelcorzo.nivo.securitycore.password_hashing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

@DisplayName("PasswordEncodeImpl Tests")
class PasswordEncodeImplTest {

  private PasswordEncoder passwordEncoder;
  private PasswordEncodeImpl passwordEncode;

  @BeforeEach
  void setUp() {
    passwordEncoder = mock(PasswordEncoder.class);
    passwordEncode = new PasswordEncodeImpl(passwordEncoder);
  }

  @Nested
  @DisplayName("Encrypt Tests")
  class EncryptTests {

    @Test
    @DisplayName("Should delegate encryption to PasswordEncoder")
    void shouldDelegateEncryptionToPasswordEncoder() {
      // Arrange
      String rawPassword = "mySecretPassword123";
      String expectedHashed = "$2a$10$hashedValueExample";
      when(passwordEncoder.encode(rawPassword)).thenReturn(expectedHashed);

      // Act
      String result = passwordEncode.encrypt(rawPassword);

      // Assert
      assertThat(result).isEqualTo(expectedHashed);
      verify(passwordEncoder).encode(rawPassword);
    }
  }

  @Nested
  @DisplayName("Matches Tests")
  class MatchesTests {

    @Test
    @DisplayName("Should return true when passwords match")
    void shouldReturnTrueWhenPasswordsMatch() {
      // Arrange
      String rawPassword = "mySecretPassword123";
      String encodedPassword = "$2a$10$hashedValueExample";
      when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(true);

      // Act
      boolean result = passwordEncode.matches(rawPassword, encodedPassword);

      // Assert
      assertThat(result).isTrue();
      verify(passwordEncoder).matches(rawPassword, encodedPassword);
    }

    @Test
    @DisplayName("Should return false when passwords do not match")
    void shouldReturnFalseWhenPasswordsDoNotMatch() {
      // Arrange
      String rawPassword = "wrongPassword";
      String encodedPassword = "$2a$10$hashedValueExample";
      when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(false);

      // Act
      boolean result = passwordEncode.matches(rawPassword, encodedPassword);

      // Assert
      assertThat(result).isFalse();
      verify(passwordEncoder).matches(rawPassword, encodedPassword);
    }
  }
}
