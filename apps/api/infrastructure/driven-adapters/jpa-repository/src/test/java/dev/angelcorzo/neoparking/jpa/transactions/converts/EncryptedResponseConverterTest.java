package dev.angelcorzo.neoparking.jpa.transactions.converts;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.neoparking.model.commons.encryption.exceptions.EncryptionError;
import dev.angelcorzo.neoparking.model.commons.encryption.exceptions.EncryptionException;
import dev.angelcorzo.neoparking.model.commons.encryption.gateways.EncryptionGateway;
import dev.angelcorzo.neoparking.model.commons.result.Result;
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
  void convertToDatabaseColumn_ShouldDecrypt() {
    String encrypted = "encryptedData";
    Object decrypted = new Object();
    when(encryptionGateway.decrypt(eq(encrypted), eq(Object.class)))
        .thenReturn(Result.success(decrypted));

    Object result = converter.convertToDatabaseColumn(encrypted);

    assertEquals(decrypted, result);
    verify(encryptionGateway).decrypt(encrypted, Object.class);
  }

  @Test
  void convertToDatabaseColumn_ShouldThrowException_WhenDecryptionFails() {
    String encrypted = "encryptedData";
    when(encryptionGateway.decrypt(eq(encrypted), eq(Object.class)))
        .thenReturn(Result.failure(new EncryptionError.DecryptionFailed()));

    assertThrows(EncryptionException.class, () -> converter.convertToDatabaseColumn(encrypted));
  }

  @Test
  void convertToEntityAttribute_ShouldEncrypt() {
    String attribute = "attributeData";
    Object encrypted = "encryptedData";
    when(encryptionGateway.decrypt(attribute, Object.class)).thenReturn(Result.success(encrypted));

    Object result = converter.convertToEntityAttribute(attribute);

    assertEquals(encrypted, result);
    verify(encryptionGateway).encrypt(attribute);
  }

  @Test
  void convertToEntityAttribute_ShouldThrowException_WhenEncryptionFails() {
    String attribute = "attributeData";
    when(encryptionGateway.encrypt(attribute))
        .thenReturn(Result.failure(new EncryptionError.EncryptionFailed()));

    assertThrows(EncryptionException.class, () -> converter.convertToEntityAttribute(attribute));
  }
}
