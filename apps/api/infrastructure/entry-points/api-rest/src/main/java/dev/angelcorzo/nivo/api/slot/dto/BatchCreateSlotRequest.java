package dev.angelcorzo.nivo.api.slot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@Schema(requiredMode = Schema.RequiredMode.REQUIRED, requiredProperties = { "parkingLotId", "slots" })
public record BatchCreateSlotRequest(
    @NotNull UUID parkingLotId,
    @NotEmpty List<@Valid CreatedSlots> slots) {
}
