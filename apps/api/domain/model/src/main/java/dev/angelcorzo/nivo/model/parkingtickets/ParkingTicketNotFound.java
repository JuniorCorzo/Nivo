package dev.angelcorzo.nivo.model.parkingtickets;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

public class ParkingTicketNotFound extends RuntimeException {
  public ParkingTicketNotFound(UUID parkingTicketId) {
    super(ErrorMessagesModel.PARKING_TICKET_NOT_FOUND.format(parkingTicketId));
  }
}
