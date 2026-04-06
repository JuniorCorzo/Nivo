package dev.angelcorzo.nivo.api.commons.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;

@Schema(requiredProperties = {"status", "data", "message", "timestamp"})
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Response<T>(String status, T data, String message, OffsetDateTime timestamp) implements BaseResponse {
  public static <T> Response<T> of(HttpStatus httpStatus, T data, String message) {
    return new Response<>(httpStatus.toString(), data, message, OffsetDateTime.now());
  }

  public static <T> Response<T> ok(T data, String message) {
    return new Response<>(HttpStatus.OK.toString(), data, message, OffsetDateTime.now());
  }

  public static <T> Response<T> created(T data, String message) {
    return new Response<>(HttpStatus.CREATED.toString(), data, message, OffsetDateTime.now());
  }
}
