package dev.angelcorzo.nivo.domain.model.parkingtickets.valueobjects;

import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.PlateCountry;
import dev.angelcorzo.nivo.domain.model.parkingtickets.exceptions.InvalidPlateFormatException;
import java.util.regex.Pattern;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@EqualsAndHashCode
public final class Plate {
    private static final Pattern CO_CAR_PATTERN = Pattern.compile("^[A-Z]{3}\\d{3}$");
    private static final Pattern CO_MOTO_PATTERN = Pattern.compile("^[A-Z]{3}\\d{2}[A-Z]$");
    private static final Pattern VE_PATTERN = Pattern.compile("^[A-Z]{2}\\d{3}[A-Z]{2}$");
    private static final Pattern UNPLATED_PATTERN = Pattern.compile("^SP-\\d+$");

    private final String value;
    private final PlateCountry country;

    private Plate(final String value, final PlateCountry country) {
        this.value = value;
        this.country = country;
    }

    public static Plate of(final String rawPlate, final PlateCountry country) {
        final PlateCountry resolvedCountry = country != null ? country : PlateCountry.CO;
        if (rawPlate == null || rawPlate.isBlank()) {
            throw new InvalidPlateFormatException("", "Plate value cannot be null or empty");
        }

        if (resolvedCountry == PlateCountry.UNPLATED) {
            final String trimmed = rawPlate.trim().toUpperCase();
            if (!UNPLATED_PATTERN.matcher(trimmed).matches()) {
                throw new InvalidPlateFormatException(rawPlate, "Unplated synthetic plate must match SP-\\d+");
            }
            return new Plate(trimmed, PlateCountry.UNPLATED);
        }

        final String normalized = rawPlate.replaceAll("[\\s-]", "").toUpperCase();

        if (resolvedCountry == PlateCountry.CO) {
            if (!CO_CAR_PATTERN.matcher(normalized).matches() && !CO_MOTO_PATTERN.matcher(normalized).matches()) {
                throw new InvalidPlateFormatException(rawPlate, "Invalid Colombian plate format");
            }
            return new Plate(normalized, PlateCountry.CO);
        }

        if (resolvedCountry == PlateCountry.VE) {
            if (!VE_PATTERN.matcher(normalized).matches()) {
                throw new InvalidPlateFormatException(rawPlate, "Invalid Venezuelan plate format");
            }
            return new Plate(normalized, PlateCountry.VE);
        }

        throw new InvalidPlateFormatException(rawPlate, "Unsupported plate country: " + resolvedCountry);
    }

    public static Plate ofUnplated(final String syntheticPlate) {
        return of(syntheticPlate, PlateCountry.UNPLATED);
    }

    public static Plate of(final String rawPlate) {
        return of(rawPlate, PlateCountry.CO);
    }
}
