package dev.angelcorzo.nivo.domain.model.payments.exceptions;

/**
 * Standardized error message templates for Payment domain operations.
 *
 * <p>
 * <strong>Layer:</strong> Domain (Payments)
 */
public enum PaymentErrorMessages {
  PAYMENT_NOT_FOUND_BY_TRANSACTION_ID("El pago con ID de transacción %s no está registrado");

  private final String template;

  PaymentErrorMessages(String template) {
    this.template = template;
  }

  public String format(Object... values) {
    return String.format(template, values);
  }

  @Override
  public String toString() {
    return template;
  }
}
