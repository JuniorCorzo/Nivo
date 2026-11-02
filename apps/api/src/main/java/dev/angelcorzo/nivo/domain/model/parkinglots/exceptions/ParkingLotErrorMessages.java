package dev.angelcorzo.nivo.domain.model.parkinglots.exceptions;

/**
 * Standardized error message templates for Parking Lot domain operations.
 *
 * <p>
 * <strong>Layer:</strong> Domain (Parking Lots)
 */
public enum ParkingLotErrorMessages {
  PARKING_NOT_EXISTS("El parking con ID %s no está registrado");

  private final String template;

  ParkingLotErrorMessages(String template) {
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
