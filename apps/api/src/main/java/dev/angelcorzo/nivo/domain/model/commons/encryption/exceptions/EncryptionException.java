package dev.angelcorzo.nivo.domain.model.commons.encryption.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

public class EncryptionException extends AppException {

  public EncryptionException(EncryptionError exception) {
    super(exception.message(), exception.status(), exception.code());
  }
}
