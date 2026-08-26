package dev.angelcorzo.nivo.jpa.transactions.converts;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.commons.encryption.exceptions.EncryptionError;
import dev.angelcorzo.nivo.model.commons.encryption.exceptions.EncryptionException;
import dev.angelcorzo.nivo.model.commons.encryption.gateways.EncryptionGateway;
import dev.angelcorzo.nivo.model.commons.result.Result;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class EncryptedResponseConverterTest {

  @Mock private EncryptionGateway encryptionGateway;

  private EncryptedResponseConverter converter;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    converter = new EncryptedResponseConverter(encryptionGateway);
  }

  @Test
  void convertToDatabaseColumn_ShouldEncrypt() {
    Object attribute = "plainData";
    String encrypted = "encryptedData";
    when(encryptionGateway.encrypt(attribute)).thenReturn(Result.success(encrypted));

    String result = converter.convertToDatabaseColumn(attribute);

    assertEquals(encrypted, result);
    verify(encryptionGateway).encrypt(attribute);
  }

  @Test
  void convertToDatabaseColumn_ShouldThrowException_WhenEncryptionFails() {
    Object attribute = "plainData";
    when(encryptionGateway.encrypt(attribute))
        .thenReturn(Result.failure(new EncryptionError.EncryptionFailed()));

    assertThrows(EncryptionException.class, () -> converter.convertToDatabaseColumn(attribute));
  }

  @Test
  void convertToEntityAttribute_ShouldDecrypt() {
    String dbData = "encryptedData";
    Object decrypted = "decryptedData";
    when(encryptionGateway.decrypt(eq(dbData), eq(Object.class)))
        .thenReturn(Result.success(decrypted));

    Object result = converter.convertToEntityAttribute(dbData);

    assertEquals(decrypted, result);
    verify(encryptionGateway).decrypt(dbData, Object.class);
  }

  @Test
  void convertToEntityAttribute_ShouldThrowException_WhenDecryptionFails() {
    String dbData = "encryptedData";
    when(encryptionGateway.decrypt(eq(dbData), eq(Object.class)))
        .thenReturn(Result.failure(new EncryptionError.DecryptionFailed()));

    assertThrows(EncryptionException.class, () -> converter.convertToEntityAttribute(dbData));
  }
}
