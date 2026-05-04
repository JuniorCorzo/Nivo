package dev.angelcorzo.nivo.api.parkingtickets.dto;

import dev.angelcorzo.nivo.api.rates.dto.RatesInfo;
import dev.angelcorzo.nivo.api.slot.dto.SlotInfo;
import dev.angelcorzo.nivo.api.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.api.users.dto.UserInfo;
import dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record ParkingTicketsDTO(
    UUID id,
    SlotInfo slot,
    TenantInfo tenant,
    UserInfo user,
    RatesInfo rate,
    String licensePlate,
    ZonedDateTime entryTime,
    ZonedDateTime exitTime,
    BigDecimal totalToCharge,
    ParkingTicketStatus status,
    String paymentMethod,
    String transactionReference,
    ZonedDateTime createdAt,
    ZonedDateTime updatedAt,
    ZonedDateTime deletedAt) {}
