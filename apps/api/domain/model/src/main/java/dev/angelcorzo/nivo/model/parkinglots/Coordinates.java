package dev.angelcorzo.nivo.model.parkinglots;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents geographic coordinates as a Value Object.
 *
 * <p>Uses WGS84 (SRID 4326) coordinate reference system.</p>
 *
 * <p><strong>Layer:</strong> Domain</p>
 * <p><strong>Responsibility:</strong> To represent a geographic point on Earth.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see ParkingLots
 */
@Getter
@Setter
@AllArgsConstructor
@Builder(toBuilder = true)
public class Coordinates {
    /** The latitude of the location. Range: -90 to 90. */
    private Double latitude;

    /** The longitude of the location. Range: -180 to 180. */
    private Double longitude;
}
