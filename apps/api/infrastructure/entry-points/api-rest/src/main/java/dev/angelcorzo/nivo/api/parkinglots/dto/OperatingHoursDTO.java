package dev.angelcorzo.nivo.api.parkinglots.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetTime;

@Schema(requiredProperties = {"openTime", "closeTime"})
public record OperatingHoursDTO(
		@NotNull OffsetTime openTime, @NotNull OffsetTime closeTime) {}
