package dev.angelcorzo.nivo.domain.model.parkingtickets.valueobjects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.PlateCountry;
import dev.angelcorzo.nivo.domain.model.parkingtickets.exceptions.InvalidPlateFormatException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("Plate Value Object Tests")
class PlateTest {

    @Nested
    @DisplayName("Colombian Plates (CO)")
    class ColombianPlates {

        @ParameterizedTest
        @ValueSource(strings = {"ABC123", "abc123", "ABC-123", "xyz789"})
        @DisplayName("Should accept valid Colombian car plate formats")
        void shouldAcceptValidCarPlates(final String rawPlate) {
            final Plate plate = Plate.of(rawPlate, PlateCountry.CO);

            assertThat(plate).isNotNull();
            assertThat(plate.getCountry()).isEqualTo(PlateCountry.CO);
            assertThat(plate.getValue()).matches("^[A-Z]{3}\\d{3}$");
        }

        @ParameterizedTest
        @ValueSource(strings = {"ABC12D", "abc12d", "XYZ-89E"})
        @DisplayName("Should accept valid Colombian motorcycle plate formats")
        void shouldAcceptValidMotorcyclePlates(final String rawPlate) {
            final Plate plate = Plate.of(rawPlate, PlateCountry.CO);

            assertThat(plate).isNotNull();
            assertThat(plate.getCountry()).isEqualTo(PlateCountry.CO);
            assertThat(plate.getValue()).matches("^[A-Z]{3}\\d{2}[A-Z]$");
        }

        @ParameterizedTest
        @ValueSource(strings = {"123ABC", "A1234", "ABCD12", "", "   "})
        @DisplayName("Should reject invalid Colombian plate formats")
        void shouldRejectInvalidPlates(final String rawPlate) {
            assertThatThrownBy(() -> Plate.of(rawPlate, PlateCountry.CO))
                .isInstanceOf(InvalidPlateFormatException.class);
        }
    }

    @Nested
    @DisplayName("Venezuelan Plates (VE)")
    class VenezuelanPlates {

        @ParameterizedTest
        @ValueSource(strings = {"AB123CD", "ab123cd", "AA-123-BB", "XY789ZT"})
        @DisplayName("Should accept valid Venezuelan plate formats")
        void shouldAcceptValidVenezuelanPlates(final String rawPlate) {
            final Plate plate = Plate.of(rawPlate, PlateCountry.VE);

            assertThat(plate).isNotNull();
            assertThat(plate.getCountry()).isEqualTo(PlateCountry.VE);
            assertThat(plate.getValue()).matches("^[A-Z]{2}\\d{3}[A-Z]{2}$");
        }

        @ParameterizedTest
        @ValueSource(strings = {"ABC123", "A12345", "1234567", ""})
        @DisplayName("Should reject invalid Venezuelan plate formats")
        void shouldRejectInvalidPlates(final String rawPlate) {
            assertThatThrownBy(() -> Plate.of(rawPlate, PlateCountry.VE))
                .isInstanceOf(InvalidPlateFormatException.class);
        }
    }

    @Nested
    @DisplayName("Unplated Vehicles (UNPLATED)")
    class UnplatedPlates {

        @ParameterizedTest
        @ValueSource(strings = {"SP-1001", "sp-1002", "SP-99999"})
        @DisplayName("Should accept valid synthetic unplated identifiers")
        void shouldAcceptValidUnplatedCodes(final String code) {
            final Plate plate = Plate.of(code, PlateCountry.UNPLATED);

            assertThat(plate).isNotNull();
            assertThat(plate.getCountry()).isEqualTo(PlateCountry.UNPLATED);
            assertThat(plate.getValue()).startsWith("SP-");
        }

        @ParameterizedTest
        @ValueSource(strings = {"1001", "ABC123", "SP1001", "SP-"})
        @DisplayName("Should reject invalid synthetic unplated identifiers")
        void shouldRejectInvalidUnplatedCodes(final String code) {
            assertThatThrownBy(() -> Plate.of(code, PlateCountry.UNPLATED))
                .isInstanceOf(InvalidPlateFormatException.class);
        }
    }

    @Test
    @DisplayName("Should default to Colombia when country is null")
    void shouldDefaultToColombiaWhenCountryIsNull() {
        final Plate plate = Plate.of("ABC123", null);

        assertThat(plate.getCountry()).isEqualTo(PlateCountry.CO);
        assertThat(plate.getValue()).isEqualTo("ABC123");
    }
}
