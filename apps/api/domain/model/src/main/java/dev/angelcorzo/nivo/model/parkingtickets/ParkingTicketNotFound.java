package dev.angelcorzo.nivo.model.parkingtickets;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class ParkingTicketNotFound extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "PARKING_TICKET_NOT_FOUND";

  public ParkingTicketNotFound(UUID parkingTicketId) {
    super(ErrorMessagesModel.PARKING_TICKET_NOT_FOUND.format(parkingTicketId), STATUS, CODE);
  }
}
