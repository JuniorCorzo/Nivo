package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.dto;

import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.PlateCountry;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto.RatesInfo;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.SlotInfo;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.UserInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(description = "Parking ticket response DTO")
public record ParkingTicketsDTO(
    @Schema(description = "Ticket ID", example = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", requiredMode = Schema.RequiredMode.REQUIRED)
    UUID id,

    @Schema(description = "Slot information", requiredMode = Schema.RequiredMode.REQUIRED)
    SlotInfo slot,

    @Schema(description = "Tenant information", requiredMode = Schema.RequiredMode.REQUIRED)
    TenantInfo tenant,

    @Schema(description = "Associated user information (if registered)", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    UserInfo user,

    @Schema(description = "Rate applied to ticket", requiredMode = Schema.RequiredMode.REQUIRED)
    RatesInfo rate,

    @Schema(description = "License plate", example = "ABC123", requiredMode = Schema.RequiredMode.REQUIRED)
    String licensePlate,

    @Schema(description = "Country of plate origin (CO, VE, UNPLATED)", example = "CO", requiredMode = Schema.RequiredMode.REQUIRED)
    PlateCountry plateCountry,

    @Schema(description = "Vehicle photo URL (if unplated or registered)", example = "https://storage.nivo.dev/unplated.jpg", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String photoUrl,

    @Schema(description = "Driver phone number", example = "+573001234567", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String phoneNumber,

    @Schema(description = "Entry timestamp in Bogota timezone", requiredMode = Schema.RequiredMode.REQUIRED)
    ZonedDateTime entryTime,

    @Schema(description = "Exit timestamp in Bogota timezone", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    ZonedDateTime exitTime,

    @Schema(description = "Total amount to charge", example = "5000.00", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    BigDecimal totalToCharge,

    @Schema(description = "Ticket lifecycle status", example = "OPEN", requiredMode = Schema.RequiredMode.REQUIRED)
    ParkingTicketStatus status,

    @Schema(description = "Payment method used", example = "EFFECTIVE", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String paymentMethod,

    @Schema(description = "Payment gateway transaction reference", example = "TRX-12345", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String transactionReference,

    @Schema(description = "Creation timestamp in Bogota timezone", requiredMode = Schema.RequiredMode.REQUIRED)
    ZonedDateTime createdAt,

    @Schema(description = "Last update timestamp in Bogota timezone", requiredMode = Schema.RequiredMode.REQUIRED)
    ZonedDateTime updatedAt,

    @Schema(description = "Deletion timestamp in Bogota timezone", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    ZonedDateTime deletedAt) {}
