package dev.angelcorzo.nivo.model.parkinglots.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

public class ParkingNotExistsException extends RuntimeException {
  public ParkingNotExistsException(UUID id) {
    super(ErrorMessagesModel.PARKING_NOT_EXISTS.format(id));
  }
}
