package dev.angelcorzo.nivo.domain.model.parkinglots.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

public class ParkingNotExistsException extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "PARKING_NOT_FOUND";

  public ParkingNotExistsException(UUID id) {
    super(ErrorMessagesModel.PARKING_NOT_EXISTS.format(id), STATUS, CODE);
  }
}
