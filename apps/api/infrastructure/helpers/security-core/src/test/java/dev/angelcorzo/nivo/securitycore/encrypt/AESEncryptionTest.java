package dev.angelcorzo.nivo.securitycore.encrypt;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.model.commons.encryption.exceptions.EncryptionError;
import dev.angelcorzo.nivo.model.commons.result.Result;
import java.security.SecureRandom;
import java.util.Map;
import org.bouncycastle.util.encoders.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("AESEncryption Tests")
class AESEncryptionTest {

  private static final String VALID_BASE64_KEY_1 = generateBase64Key();
  private static final String VALID_BASE64_KEY_2 = generateBase64Key();

  private ObjectMapper objectMapper;
  private AESEncryption aesEncryption;

  private static String generateBase64Key() {
    byte[] key = new byte[32];
    new SecureRandom().nextBytes(key);
    return Base64.toBase64String(key);
  }

  record SampleData(String name, int age, String secret) {}

  @BeforeEach
  void setUp() {
    objectMapper = new ObjectMapper();
    aesEncryption = new AESEncryption(VALID_BASE64_KEY_1, objectMapper);
  }

  @Nested
  @DisplayName("Encrypt & Decrypt Round-trip")
  class RoundTripTests {

    @Test
    @DisplayName("Should successfully encrypt and decrypt a record object")
    void shouldEncryptAndDecryptObjectSuccessfully() {
      // Arrange
      SampleData sample = new SampleData("John Doe", 30, "top-secret-info");

      // Act
      Result<String, EncryptionError> encryptResult = aesEncryption.encrypt(sample);

      // Assert Encrypt
      assertThat(encryptResult.isSuccess()).isTrue();
      String cipherText = encryptResult.get();
      assertThat(cipherText).isNotBlank();

      // Act Decrypt
      Result<SampleData, EncryptionError> decryptResult =
          aesEncryption.decrypt(cipherText, SampleData.class);

      // Assert Decrypt
      assertThat(decryptResult.isSuccess()).isTrue();
      assertThat(decryptResult.get()).isEqualTo(sample);
    }

    @Test
    @DisplayName("Should successfully encrypt and decrypt a Map")
    void shouldEncryptAndDecryptMapSuccessfully() {
      // Arrange
      Map<String, String> data = Map.of("card", "1234567890123456", "cvv", "123");

      // Act
      Result<String, EncryptionError> encryptResult = aesEncryption.encrypt(data);
      assertThat(encryptResult.isSuccess()).isTrue();

      Result<Map, EncryptionError> decryptResult =
          aesEncryption.decrypt(encryptResult.get(), Map.class);

      // Assert
      assertThat(decryptResult.isSuccess()).isTrue();
      assertThat(decryptResult.get().get("card")).isEqualTo("1234567890123456");
      assertThat(decryptResult.get().get("cvv")).isEqualTo("123");
    }

    @Test
    @DisplayName("Should produce different ciphertexts for the same data due to random IV")
    void shouldProduceDifferentCiphertextsDueToRandomIv() {
      // Arrange
      SampleData sample = new SampleData("Jane", 25, "secret");

      // Act
      Result<String, EncryptionError> result1 = aesEncryption.encrypt(sample);
      Result<String, EncryptionError> result2 = aesEncryption.encrypt(sample);

      // Assert
      assertThat(result1.get()).isNotEqualTo(result2.get());
      assertThat(aesEncryption.decrypt(result1.get(), SampleData.class).get()).isEqualTo(sample);
      assertThat(aesEncryption.decrypt(result2.get(), SampleData.class).get()).isEqualTo(sample);
    }
  }

  @Nested
  @DisplayName("Failure & Edge Cases")
  class FailureCases {

    @Test
    @DisplayName("Should return DecryptionFailed when ciphertext is tampered")
    void shouldReturnDecryptionFailedWhenCiphertextIsTampered() {
      // Arrange
      SampleData sample = new SampleData("Alice", 28, "password");
      Result<String, EncryptionError> encryptResult = aesEncryption.encrypt(sample);
      byte[] cipherBytes = Base64.decode(encryptResult.get());
      // Tamper one byte in the payload
      cipherBytes[cipherBytes.length - 1] ^= 0xFF;
      String tamperedCipher = Base64.toBase64String(cipherBytes);

      // Act
      Result<SampleData, EncryptionError> decryptResult =
          aesEncryption.decrypt(tamperedCipher, SampleData.class);

      // Assert
      assertThat(decryptResult.isSuccess()).isFalse();
      assertThat(decryptResult.getError()).isInstanceOf(EncryptionError.DecryptionFailed.class);
    }

    @Test
    @DisplayName("Should return DecryptionFailed when decrypting with wrong key")
    void shouldReturnDecryptionFailedWhenDecryptingWithWrongKey() {
      // Arrange
      AESEncryption anotherKeyEncryption = new AESEncryption(VALID_BASE64_KEY_2, objectMapper);
      SampleData sample = new SampleData("Bob", 40, "private");
      String cipherText = aesEncryption.encrypt(sample).get();

      // Act
      Result<SampleData, EncryptionError> decryptResult =
          anotherKeyEncryption.decrypt(cipherText, SampleData.class);

      // Assert
      assertThat(decryptResult.isSuccess()).isFalse();
      assertThat(decryptResult.getError()).isInstanceOf(EncryptionError.DecryptionFailed.class);
    }

    @Test
    @DisplayName("Should return DecryptionFailed on invalid base64 input")
    void shouldReturnDecryptionFailedOnInvalidBase64Input() {
      // Act
      Result<SampleData, EncryptionError> decryptResult =
          aesEncryption.decrypt("not-a-valid-base64-string!!!", SampleData.class);

      // Assert
      assertThat(decryptResult.isSuccess()).isFalse();
      assertThat(decryptResult.getError()).isInstanceOf(EncryptionError.DecryptionFailed.class);
    }

    @Test
    @DisplayName("Should return failure when data cannot be decrypted/deserialized to target class")
    void shouldReturnFailureWhenTargetClassMismatch() {
      // Arrange: encrypt a plain string JSON
      Result<String, EncryptionError> encryptResult = aesEncryption.encrypt("just a string");

      // Act: try to deserialize as an incompatible complex object type
      Result<SampleData, EncryptionError> decryptResult =
          aesEncryption.decrypt(encryptResult.get(), SampleData.class);

      // Assert
      assertThat(decryptResult.isSuccess()).isFalse();
      assertThat(decryptResult.getError()).isInstanceOf(EncryptionError.DecryptionFailed.class);
    }
  }
}
