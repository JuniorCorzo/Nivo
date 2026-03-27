package dev.angelcorzo.nivo.api.parkinglots.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetTime;

public record OperatingHoursDTO(
		@NotNull OffsetTime openTime, @NotNull OffsetTime closeTime) {}
