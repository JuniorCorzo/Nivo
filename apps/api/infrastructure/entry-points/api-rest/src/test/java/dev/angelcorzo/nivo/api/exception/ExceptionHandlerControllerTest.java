package dev.angelcorzo.nivo.api.exception;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.api.commons.dto.ResponseError;
import dev.angelcorzo.nivo.model.authentication.exceptions.ExpiredTokenException;
import dev.angelcorzo.nivo.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.model.users.exceptions.UserAlreadyExistsInTenantException;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsException;
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
}
