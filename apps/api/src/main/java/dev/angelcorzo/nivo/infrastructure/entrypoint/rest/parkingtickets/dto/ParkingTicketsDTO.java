package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.dto;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto.RatesInfo;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.SlotInfo;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.UserInfo;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
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
