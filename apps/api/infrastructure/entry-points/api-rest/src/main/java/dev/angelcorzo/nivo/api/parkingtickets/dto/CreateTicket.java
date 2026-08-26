package dev.angelcorzo.nivo.api.parkingtickets.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Builder;

@Builder
@Schema(description = "Payload to check-in a vehicle and create a parking ticket")
public record CreateTicket(
    @Schema(description = "Slot ID assigned to the vehicle", example = "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID slotId,

    @Schema(description = "Rate tariff ID to apply", example = "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID rateId,

    @Schema(description = "Customer email address (optional)", example = "driver@example.com")
    String email,

    @Schema(description = "Vehicle license plate", example = "ABC-123", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty String plate) {}

