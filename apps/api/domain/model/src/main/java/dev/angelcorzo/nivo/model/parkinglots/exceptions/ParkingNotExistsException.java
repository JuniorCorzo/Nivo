package dev.angelcorzo.nivo.model.parkinglots.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class ParkingNotExistsException extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "PARKING_NOT_FOUND";

  public ParkingNotExistsException(UUID id) {
    super(ErrorMessagesModel.PARKING_NOT_EXISTS.format(id), STATUS, CODE);
  }
}
