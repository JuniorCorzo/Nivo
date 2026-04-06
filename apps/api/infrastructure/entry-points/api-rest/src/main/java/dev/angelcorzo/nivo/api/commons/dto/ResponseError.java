package dev.angelcorzo.nivo.api.commons.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;

@Schema(requiredProperties = {"status", "code", "error", "message", "timestamp"})
public record ResponseError<T>(
    String status, String code, T error, String message, OffsetDateTime timestamp)
    implements BaseResponse {
  public static <T> ResponseError<T> of(
      HttpStatus httpStatus, String code, T error, String message) {
    return new ResponseError<>(httpStatus.toString(), code, error, message, OffsetDateTime.now());
  }
}
