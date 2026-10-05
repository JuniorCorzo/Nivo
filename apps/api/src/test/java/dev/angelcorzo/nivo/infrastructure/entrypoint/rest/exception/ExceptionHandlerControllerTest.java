package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.exception;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.dto.ResponseError;
import dev.angelcorzo.nivo.domain.model.authentication.exceptions.ExpiredTokenException;
import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserAlreadyExistsInTenantException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserNotExistsException;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@DisplayName("ExceptionHandlerController Tests")
class ExceptionHandlerControllerTest {

  private ExceptionHandlerController exceptionHandlerController;

  @BeforeEach
  void setUp() {
    exceptionHandlerController = new ExceptionHandlerController();
  }

  @Test
  @DisplayName("Should handle 401 Unauthorized exceptions properly")
  void shouldHandleUnauthorizedExceptions() {
    // Arrange
    AppException ex = new ExpiredTokenException();

    // Act
    ResponseEntity<ResponseError<Object>> response = exceptionHandlerController.appException(ex);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo(ex.getCode());
    assertThat(response.getBody().error()).isEqualTo(ex.getMessage());
  }

  @Test
  @DisplayName("Should handle 404 Not Found exceptions properly")
  void shouldHandleNotFoundExceptions() {
    // Arrange
    AppException ex = new UserNotExistsException(UUID.randomUUID());

    // Act
    ResponseEntity<ResponseError<Object>> response = exceptionHandlerController.appException(ex);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo(ex.getCode());
  }

  @Test
  @DisplayName("Should handle 409 Conflict exceptions properly")
  void shouldHandleConflictExceptions() {
    // Arrange
    AppException ex = new UserAlreadyExistsInTenantException("test@example.com");

    // Act
    ResponseEntity<ResponseError<Object>> response = exceptionHandlerController.appException(ex);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo(ex.getCode());
  }

  @Test
  @DisplayName("Should handle generic AppException with custom status code")
  void shouldHandleGenericAppException() {
    // Arrange
    AppException customEx =
        new AppException("Payload validation failed", 400, "INVALID_PAYLOAD") {};

    // Act
    ResponseEntity<ResponseError<Object>> response =
        exceptionHandlerController.appException(customEx);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo("INVALID_PAYLOAD");
    assertThat(response.getBody().error()).isEqualTo("Payload validation failed");
  }

  @Test
  @DisplayName("Should handle SlotCannotBeModifiedException with 409 Conflict")
  void shouldHandleSlotCannotBeModifiedException() {
    // Arrange
    dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException ex =
        new dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException(
            java.util.List.of(UUID.randomUUID()));

    // Act
    ResponseEntity<ResponseError<Object>> response =
        exceptionHandlerController.handleSlotCannotBeModified(ex);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo("SLOT_CANNOT_BE_MODIFIED");
  }

  @Test
  @DisplayName("Should handle MethodArgumentNotValidException with 400 Bad Request and field errors")
  void shouldHandleMethodArgumentNotValidException() {
    // Arrange
    org.springframework.web.bind.MethodArgumentNotValidException ex =
        org.mockito.Mockito.mock(org.springframework.web.bind.MethodArgumentNotValidException.class);
    org.springframework.validation.BindingResult bindingResult =
        new org.springframework.validation.BeanPropertyBindingResult(new Object(), "target");
    bindingResult.addError(new org.springframework.validation.FieldError("target", "prefix", "must not be blank"));
    org.mockito.Mockito.when(ex.getBindingResult()).thenReturn(bindingResult);

    // Act
    ResponseEntity<ResponseError<Object>> response =
        exceptionHandlerController.handleValidationException(ex);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo("VALIDATION_FAILED");
    assertThat(response.getBody().error()).isEqualTo("prefix: must not be blank");
  }

  @Test
  @DisplayName("Should handle MethodArgumentNotValidException with default message when no field errors exist")
  void shouldHandleMethodArgumentNotValidExceptionWithDefaultMessage() {
    // Arrange
    org.springframework.web.bind.MethodArgumentNotValidException ex =
        org.mockito.Mockito.mock(org.springframework.web.bind.MethodArgumentNotValidException.class);
    org.springframework.validation.BindingResult bindingResult =
        new org.springframework.validation.BeanPropertyBindingResult(new Object(), "target");
    org.mockito.Mockito.when(ex.getBindingResult()).thenReturn(bindingResult);

    // Act
    ResponseEntity<ResponseError<Object>> response =
        exceptionHandlerController.handleValidationException(ex);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo("VALIDATION_FAILED");
    assertThat(response.getBody().error()).isEqualTo("Validation error");
  }
}
