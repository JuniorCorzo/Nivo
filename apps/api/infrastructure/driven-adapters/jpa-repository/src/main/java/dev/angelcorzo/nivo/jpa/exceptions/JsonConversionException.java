package dev.angelcorzo.nivo.jpa.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class JsonConversionException extends AppException {
  private static final int STATUS = 500;
  private static final String CODE = "JSON_CONVERSION_ERROR";

  public JsonConversionException(String message, Throwable cause) {
    super(message, STATUS, CODE, cause);
  }
}
