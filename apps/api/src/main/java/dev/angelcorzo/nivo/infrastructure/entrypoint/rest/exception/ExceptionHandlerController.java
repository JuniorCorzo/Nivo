package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.exception;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.dto.ResponseError;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
public class ExceptionHandlerController {

  @ExceptionHandler(AppException.class)
  ResponseEntity<ResponseError<Object>> appException(AppException ex) {
    final HttpStatus status = HttpStatus.valueOf(ex.getStatus());
    return ResponseEntity.status(status).body(ResponseError.of(status, ex.getCode(), ex.getMessage(), ""));
  }

  @ExceptionHandler(SlotCannotBeModifiedException.class)
  ResponseEntity<ResponseError<Object>> handleSlotCannotBeModified(SlotCannotBeModifiedException ex) {
    final HttpStatus status = HttpStatus.CONFLICT;
    return ResponseEntity.status(status).body(ResponseError.of(status, ex.getCode(), ex.getMessage(), ""));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ResponseError<Object>> handleValidationException(MethodArgumentNotValidException ex) {
    String message = ex.getBindingResult()
      .getFieldErrors()
      .stream()
      .map(error -> error.getField() + ": " + error.getDefaultMessage())
      .collect(Collectors.joining(", "));
    if (message.isBlank()) {
      message = "Validation error";
    }
    final HttpStatus status = HttpStatus.BAD_REQUEST;
    return ResponseEntity.status(status).body(ResponseError.of(status, "VALIDATION_FAILED", message, ""));
  }

  @ExceptionHandler(MissingRequestCookieException.class)
  ResponseEntity<ResponseError<Object>> handleMissingRequestCookie(MissingRequestCookieException ex) {
    final boolean isRefreshToken = "refreshToken".equals(ex.getCookieName());
    final HttpStatus status = isRefreshToken ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST;
    final String code = isRefreshToken ? "UNAUTHORIZED" : "MISSING_COOKIE";
    return ResponseEntity.status(status).body(ResponseError.of(status, code, ex.getMessage(), ""));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ResponseError<Object>> handleGenericException(Exception ex) throws Exception {
    if (ex instanceof AccessDeniedException || ex instanceof AuthenticationException) {
      throw ex;
    }
    log.error("Unhandled exception intercepted by ExceptionHandlerController: ", ex);
    final HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
    return ResponseEntity.status(status)
      .body(ResponseError.of(status, "INTERNAL_SERVER_ERROR", "An unexpected error occurred", ""));
  }
}
