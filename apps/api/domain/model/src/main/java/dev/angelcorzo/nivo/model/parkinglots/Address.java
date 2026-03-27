package dev.angelcorzo.nivo.model.parkinglots;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a physical address as a Value Object.
 *
 * <p>This class is immutable and its instances are defined by their attribute values.
 * It is used within the {@link ParkingLots} aggregate to specify its location.</p>
 *
 * <p><strong>Layer:</strong> Domain</p>
 * <p><strong>Responsibility:</strong> To represent a physical address in a structured way.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see ParkingLots
 */
@Getter
@Setter
@AllArgsConstructor
@Builder(toBuilder = true)
public class Address {
    /**
     * The street name and number.
     * Example: "Carrera 7 # 11-10".
     */
    private String street;
    /**
     * The city name.
     * Example: "Bogotá".
     */
    private String city;
    /**
     * The state, province, or region.
     * Example: "Cundinamarca".
     */
    private String state;
    /**
     * The country name.
     * Example: "Colombia".
     */
    private String country;
    /**
     * The postal or ZIP code.
     * Example: "110311".
     */
    private String zipCode;
}
