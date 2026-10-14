package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.dto;

import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.PlateCountry;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Builder;

@Builder
@Schema(description = "Payload to check-in a vehicle and create a parking ticket")
public record CreateTicket(
    @Schema(
        description = "Slot ID assigned to the vehicle",
        example = "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
        requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull
    UUID slotId,

    @Schema(
        description = "Rate tariff ID to apply",
        example = "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
        requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull
    UUID rateId,

    @Schema(
        description = "Customer email address (optional)",
        example = "driver@example.com",
        requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String email,

    @Schema(
        description = "Vehicle license plate (optional when plateCountry is UNPLATED)",
        example = "ABC123",
        requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String plate,

    @Schema(
        description = "Country origin of vehicle license plate (CO, VE, UNPLATED)",
        example = "CO",
        defaultValue = "CO",
        requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    PlateCountry plateCountry,

    @Schema(
        description = "Photo URL of vehicle (mandatory for UNPLATED vehicles)",
        example = "https://storage.nivo.dev/photos/unplated-123.jpg",
        requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String photoUrl,

    @Schema(
        description = "Driver phone number for SMS or WhatsApp notifications",
        example = "+573001234567",
        requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String phoneNumber) {

  public CreateTicket(final UUID slotId, final UUID rateId, final String email, final String plate) {
    this(slotId, rateId, email, plate, PlateCountry.CO, null, null);
  }
}
