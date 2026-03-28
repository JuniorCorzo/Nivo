package dev.angelcorzo.nivo.model.parkinglots;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetTime;

/**
 * Represents the operating hours of a parking lot as a Value Object.
 *
 * <p>This class defines the daily window of operation for a parking lot.</p>
 *
 * <p><strong>Layer:</strong> Domain</p>
 * <p><strong>Responsibility:</strong> To represent a time range for business operations.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see ParkingLots
 */
@Getter
@Setter
@AllArgsConstructor
@Builder(toBuilder = true)
public class OperatingHours {
    /**
     * The time when the parking lot opens.
     * Includes time and timezone offset. Example: "08:00:00-05:00".
     */
    private OffsetTime openTime;
    /**
     * The time when the parking lot closes.
     * Includes time and timezone offset. Example: "20:00:00-05:00".
     */
    private OffsetTime closeTime;
}
