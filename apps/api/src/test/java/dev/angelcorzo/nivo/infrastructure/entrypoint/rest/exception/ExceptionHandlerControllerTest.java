package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.authentication.exceptions.ExpiredTokenException;
import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserAlreadyExistsInTenantException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserNotExistsException;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.dto.ResponseError;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;

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
    AppException customEx = new AppException("Payload validation failed", 400, "INVALID_PAYLOAD") {
    };

    // Act
    ResponseEntity<ResponseError<Object>> response = exceptionHandlerController.appException(customEx);

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
    SlotCannotBeModifiedException ex = new SlotCannotBeModifiedException(List.of(UUID.randomUUID()));

    // Act
    ResponseEntity<ResponseError<Object>> response = exceptionHandlerController.handleSlotCannotBeModified(ex);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo("SLOT_CANNOT_BE_MODIFIED");
  }

  @Test
  @DisplayName("Should handle MethodArgumentNotValidException with 400 Bad Request and field errors")
  void shouldHandleMethodArgumentNotValidException() {
    // Arrange
    MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
    BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "target");
    bindingResult.addError(new FieldError("target", "prefix", "must not be blank"));
    when(ex.getBindingResult()).thenReturn(bindingResult);

    // Act
    ResponseEntity<ResponseError<Object>> response = exceptionHandlerController.handleValidationException(ex);

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
    MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
    BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "target");
    when(ex.getBindingResult()).thenReturn(bindingResult);

    // Act
    ResponseEntity<ResponseError<Object>> response = exceptionHandlerController.handleValidationException(ex);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo("VALIDATION_FAILED");
    assertThat(response.getBody().error()).isEqualTo("Validation error");
  }

  @Test
  @DisplayName("Should handle generic unhandled exceptions with 500 INTERNAL_SERVER_ERROR")
  void shouldHandleGenericException() throws Exception {
    Exception ex = new RuntimeException("Unexpected database failure");

    ResponseEntity<ResponseError<Object>> response = exceptionHandlerController.handleGenericException(ex);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo("INTERNAL_SERVER_ERROR");
    assertThat(response.getBody().error()).isEqualTo("An unexpected error occurred");
  }

  @Test
  @DisplayName("Should rethrow AccessDeniedException so Spring Security handles it")
  void shouldRethrowAccessDeniedException() {
    AccessDeniedException ex = new AccessDeniedException("Access is denied");

    assertThatThrownBy(() -> exceptionHandlerController.handleGenericException(ex))
      .isInstanceOf(AccessDeniedException.class);
  }

  @Test
  @DisplayName("Should handle MissingRequestCookieException with 401 when refreshToken is missing")
  void shouldHandleMissingRefreshTokenCookie() {
    MissingRequestCookieException ex = mock(MissingRequestCookieException.class);
    when(ex.getCookieName()).thenReturn("refreshToken");
    when(ex.getMessage()).thenReturn("Required cookie 'refreshToken' is not present");

    ResponseEntity<ResponseError<Object>> response = exceptionHandlerController.handleMissingRequestCookie(ex);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo("UNAUTHORIZED");
  }

  @Test
  @DisplayName("Should handle MissingRequestCookieException with 400 when other cookie is missing")
  void shouldHandleMissingGenericCookie() {
    MissingRequestCookieException ex = mock(MissingRequestCookieException.class);
    when(ex.getCookieName()).thenReturn("session");
    when(ex.getMessage()).thenReturn("Required cookie 'session' is not present");

    ResponseEntity<ResponseError<Object>> response = exceptionHandlerController.handleMissingRequestCookie(ex);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().code()).isEqualTo("MISSING_COOKIE");
  }
}
