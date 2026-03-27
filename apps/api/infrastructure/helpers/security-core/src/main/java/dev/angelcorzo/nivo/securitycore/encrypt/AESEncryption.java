package dev.angelcorzo.nivo.securitycore.encrypt;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.model.commons.encryption.exceptions.EncryptionError;
import dev.angelcorzo.nivo.model.commons.encryption.gateways.EncryptionGateway;
import dev.angelcorzo.nivo.model.commons.result.Result;
import java.io.IOException;
import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.util.encoders.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AESEncryption implements EncryptionGateway {
  private static final String ALGORITHM = "AES/GCM/NoPadding";
  private static final int IV_LENGTH = 12;
  private static final int TAG_LENGTH = 128;

  private final SecretKey secretKey;
  private final ObjectMapper objectMapper;

  public AESEncryption(
      @Value("${security.aes.secret-key}") String secretKey, ObjectMapper objectMapper) {
    final byte[] key = Base64.decode(secretKey.getBytes());
    this.secretKey = new SecretKeySpec(key, "AES");
    this.objectMapper = objectMapper;
  }

  @Override
  public <T> Result<String, EncryptionError> encrypt(T data) {
    try {
      final Cipher cipher = Cipher.getInstance(ALGORITHM);

      final byte[] iv = new byte[IV_LENGTH];
      new SecureRandom().nextBytes(iv);
      final GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH, iv);

      cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

      final byte[] encryptedData = cipher.doFinal(objectMapper.writeValueAsBytes(data));
      final byte[] combined = new byte[iv.length + encryptedData.length];

      System.arraycopy(iv, 0, combined, 0, iv.length);
      System.arraycopy(encryptedData, 0, combined, iv.length, encryptedData.length);

      return Result.success(Base64.toBase64String(combined));
    } catch (Exception e) {
      log.error("Failed to encrypt object", e);
      return Result.failure(new EncryptionError.EncryptionFailed());
    }
  }

  @Override
  public <T> Result<T, EncryptionError> decrypt(String data, Class<T> clazz) {
    try {
      final Cipher cipher = Cipher.getInstance(ALGORITHM);

      final byte[] combined = Base64.decode(data);
      final byte[] iv = new byte[IV_LENGTH];
      final byte[] encrypted = new byte[combined.length - IV_LENGTH];
      System.arraycopy(combined, 0, iv, 0, IV_LENGTH);
      System.arraycopy(combined, IV_LENGTH, encrypted, 0, encrypted.length);

      final GCMParameterSpec parameterSpec = new GCMParameterSpec(IV_LENGTH, iv);
      cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

      final byte[] decrypt = cipher.doFinal(encrypted);

      return Result.success(this.objectMapper.readValue(decrypt, clazz));

    } catch (IOException e) {
      log.error("Failed to deserialize JSON to object of type {}", clazz.getName(), e);
      return Result.failure(new EncryptionError.DecryptionFailed("Error al deserializar"));
    } catch (Exception e) {
      log.error("Failed to decrypt object", e);
      return Result.failure(new EncryptionError.DecryptionFailed());
    }
  }
}
