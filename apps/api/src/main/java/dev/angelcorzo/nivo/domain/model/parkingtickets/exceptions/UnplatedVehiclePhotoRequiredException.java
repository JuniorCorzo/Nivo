package dev.angelcorzo.nivo.domain.model.parkingtickets.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

public class UnplatedVehiclePhotoRequiredException extends AppException {
    public UnplatedVehiclePhotoRequiredException() {
        super("Unplated vehicle check-in requires a valid photo URL", 400, "UNPLATED_VEHICLE_PHOTO_REQUIRED");
    }
}
