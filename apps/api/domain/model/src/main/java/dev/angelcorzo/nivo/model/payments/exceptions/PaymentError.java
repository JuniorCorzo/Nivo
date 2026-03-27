package dev.angelcorzo.nivo.model.payments.exceptions;

import dev.angelcorzo.nivo.model.commons.result.DomainError;
import java.math.BigDecimal;
import java.util.UUID;

public sealed interface PaymentError extends DomainError
    permits PaymentError.Duplicate,
        PaymentError.InvalidAmount,
        PaymentError.TicketNotFound,
        PaymentError.ConcurrentMod,
        PaymentError.ProviderTimeout,
        PaymentError.ProviderValidation,
        PaymentError.DatabaseError,
        PaymentError.ProviderServerError,
        PaymentError.ProviderRateLimited,
        PaymentError.ProviderDeserialization,
        PaymentError.ProviderEmptyResponse,
        PaymentError.ProviderUnexpectedError {

  record Duplicate(UUID ticketId, int status, String code, String message, Severity severity)
      implements PaymentError {
    public Duplicate(UUID ticketId) {
      this(
          ticketId,
          409,
          "DUPLICATE_PAYMENT",
          "Ticket " + ticketId + " ya tiene pago",
          Severity.ERROR);
    }

    public Duplicate(UUID ticketId, int status) {
      this(
          ticketId,
          status,
          "DUPLICATE_PAYMENT",
          "Ticket " + ticketId + " ya tiene pago",
          Severity.ERROR);
    }
  }

  record InvalidAmount(
      BigDecimal amount, int status, String code, String message, Severity severity)
      implements PaymentError {
    public InvalidAmount(BigDecimal amount) {
      this(amount, 400, "INVALID_AMOUNT", "Monto inválido: " + amount, Severity.ERROR);
    }
  }

  record TicketNotFound(UUID ticketId, int status, String code, String message, Severity severity)
      implements PaymentError {
    public TicketNotFound(UUID ticketId) {
      this(ticketId, 404, "TICKET_NOT_FOUND", "Ticket no encontrado: " + ticketId, Severity.ERROR);
    }
  }

  record ConcurrentMod(String entity, int status, String code, String message, Severity severity)
      implements PaymentError {
    public ConcurrentMod(String entity) {
      this(
          entity,
          409,
          "CONCURRENT_MODIFICATION",
          entity + " modificado concurrentemente",
          Severity.WARNING);
    }
  }

  record ProviderTimeout(
      String provider, int status, String code, String message, Severity severity)
      implements PaymentError {
    public ProviderTimeout(String provider) {
      this(provider, 504, "PROVIDER_TIMEOUT", provider + " no respondió (retry)", Severity.WARNING);
    }
  }

  record ProviderValidation(
      String reason, int status, String code, String message, Severity severity)
      implements PaymentError {
    public ProviderValidation(String reason) {
      this(reason, 400, "PROVIDER_VALIDATION", reason, Severity.ERROR);
    }

    public ProviderValidation(String reason, int status) {
      this(reason, status, "PROVIDER_VALIDATION", reason, Severity.ERROR);
    }
  }

  record DatabaseError(String operation, int status, String code, String message, Severity severity)
      implements PaymentError {
    public DatabaseError(String operation) {
      this(operation, 500, "DATABASE_ERROR", "Error BD: " + operation, Severity.CRITICAL);
    }
  }

  record ProviderServerError(
      String provider, int status, String code, String message, Severity severity)
      implements PaymentError {
    public ProviderServerError(String provider, String detail) {
      this(
          provider,
          502,
          "PROVIDER_SERVER_ERROR",
          provider + " respondió con error: " + detail,
          Severity.ERROR);
    }
  }

  record ProviderRateLimited(
      String provider, int status, String code, String message, Severity severity)
      implements PaymentError {
    public ProviderRateLimited(String provider) {
      this(
          provider,
          429,
          "PROVIDER_RATE_LIMITED",
          provider + " rechazó la solicitud por exceso de peticiones",
          Severity.WARNING);
    }
  }

  record ProviderDeserialization(
      String provider, int status, String code, String message, Severity severity)
      implements PaymentError {
    public ProviderDeserialization(String provider, String detail) {
      this(
          provider,
          502,
          "PROVIDER_DESERIALIZATION",
          "Error de deserialización de " + provider + ": " + detail,
          Severity.ERROR);
    }
  }

  record ProviderEmptyResponse(
      String provider, int status, String code, String message, Severity severity)
      implements PaymentError {
    public ProviderEmptyResponse(String provider) {
      this(
          provider,
          502,
          "PROVIDER_EMPTY_RESPONSE",
          provider + " devolvió una respuesta vacía",
          Severity.ERROR);
    }
  }

  record ProviderUnexpectedError(
      String provider, int status, String code, String message, Severity severity)
      implements PaymentError {
    public ProviderUnexpectedError(String provider, String detail) {
      this(
          provider,
          500,
          "PROVIDER_UNEXPECTED_ERROR",
          "Error inesperado de " + provider + ": " + detail,
          Severity.CRITICAL);
    }
  }
}
