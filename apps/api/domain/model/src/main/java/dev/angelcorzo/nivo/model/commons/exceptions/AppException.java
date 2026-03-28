package dev.angelcorzo.nivo.model.commons.exceptions;

import lombok.Getter;

@Getter
public abstract class AppException extends RuntimeException {
  private final int status;
  private final String code;

  public AppException(String message, int status, String code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
