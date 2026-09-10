package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.exception;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.dto.ResponseError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ExceptionHandlerController {

  @ExceptionHandler(AppException.class)
  ResponseEntity<ResponseError<Object>> appException(AppException ex) {
    final HttpStatus status = HttpStatus.valueOf(ex.getStatus());
    return ResponseEntity.status(status)
        .body(ResponseError.of(status, ex.getCode(), ex.getMessage(), ""));
  }

  @ExceptionHandler(SlotCannotBeModifiedException.class)
  ResponseEntity<ResponseError<Object>> handleSlotCannotBeModified(SlotCannotBeModifiedException ex) {
    final HttpStatus status = HttpStatus.CONFLICT;
    return ResponseEntity.status(status)
        .body(ResponseError.of(status, ex.getCode(), ex.getMessage(), ""));
  }
}
