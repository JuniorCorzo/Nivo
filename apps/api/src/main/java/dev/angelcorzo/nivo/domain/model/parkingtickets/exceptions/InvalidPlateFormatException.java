package dev.angelcorzo.nivo.domain.model.parkingtickets.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

public class InvalidPlateFormatException extends AppException {
    public InvalidPlateFormatException(final String plate) {
        super("Invalid license plate format: " + plate, 400, "INVALID_PLATE_FORMAT");
    }

    public InvalidPlateFormatException(final String plate, final String reason) {
        super("Invalid license plate format: " + plate + " - " + reason, 400, "INVALID_PLATE_FORMAT");
    }
}
