package dev.angelcorzo.nivo.api.slot.dto;

import dev.angelcorzo.nivo.api.parkinglots.dto.ParkingLotsInfo;
import dev.angelcorzo.nivo.api.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder(toBuilder = true)
public record SlotResponse(
    UUID id,
    TenantInfo tenant,
    ParkingLotsInfo parking,
    String slotNumber,
    SlotType type,
    SlotStatus status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    OffsetDateTime deletedAt) {}
