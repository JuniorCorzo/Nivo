package dev.angelcorzo.nivo.domain.model.parkingtickets;

/**
 * Standardized error message templates for Parking Ticket domain operations.
 *
 * <p>
 * <strong>Layer:</strong> Domain (Tickets)
 */
public enum ParkingTicketErrorMessages {
  PARKING_TICKET_NOT_FOUND("La reserva con ID %s no está registrada");

  private final String template;

  ParkingTicketErrorMessages(String template) {
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
