package dev.angelcorzo.nivo.domain.model.rates.exceptions;

/**
 * Standardized error message templates for Rate domain operations.
 *
 * <p>
 * <strong>Layer:</strong> Domain (Rates)
 */
public enum RateDomainErrorMessages {
  RATE_NOT_FOUND("La tarifa con ID %s no está registrada"),
  RATE_IN_USE("La tarifa con ID %s no puede ser desactivada porque está en uso por tickets activos");

  private final String template;

  RateDomainErrorMessages(String template) {
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
