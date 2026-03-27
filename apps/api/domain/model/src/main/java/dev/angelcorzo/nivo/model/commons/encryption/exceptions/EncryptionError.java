package dev.angelcorzo.nivo.model.commons.encryption.exceptions;

import dev.angelcorzo.nivo.model.commons.result.DomainError;

public sealed interface EncryptionError extends DomainError
    permits EncryptionError.EncryptionFailed, EncryptionError.DecryptionFailed {

  record EncryptionFailed(int status, String code, String message, Severity severity)
      implements EncryptionError {
    public EncryptionFailed() {
      this(500, "ENCRYPTION_ERROR", "Error de encriptación", Severity.CRITICAL);
    }

    public EncryptionFailed(String reason) {
      this(500, "ENCRYPTION_ERROR", "Error de encriptación: " + reason, Severity.CRITICAL);
    }
  }

  record DecryptionFailed(int status, String code, String message, Severity severity)
      implements EncryptionError {
    public DecryptionFailed() {
      this(500, "DECRYPTION_ERROR", "Error de desencriptación", Severity.CRITICAL);
    }

    public DecryptionFailed(String reason) {
      this(500, "DECRYPTION_ERROR", "Error de desencriptación: " + reason, Severity.CRITICAL);
    }
  }
}
