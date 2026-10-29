package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.Builder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
@Schema(description = "Real-time operational telemetry for a parking facility")
public record ParkingTelemetryResponse(
    @Schema(description = "Parking lot ID", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    UUID parkingId,

    @Schema(description = "Total capacity of non-maintenance slots", example = "100")
    Integer totalCapacity,

    @Schema(description = "Number of occupied or reserved slots", example = "42")
    Integer occupiedSlots,

    @Schema(description = "Number of available slots", example = "58")
    Integer availableSlots,

    @Schema(description = "Occupancy rate percentage (0.0 - 100.0)", example = "42.0")
    Double occupancyRate,

    @Schema(description = "Total capacity for cars", example = "70")
    Integer carTotal,

    @Schema(description = "Number of occupied car slots", example = "35")
    Integer carOccupied,

    @Schema(description = "Car occupancy rate percentage", example = "50.0")
    Double carRate,

    @Schema(description = "Total capacity for motorcycles", example = "30")
    Integer motoTotal,

    @Schema(description = "Number of occupied motorcycle slots", example = "7")
    Integer motoOccupied,

    @Schema(description = "Motorcycle occupancy rate percentage", example = "23.3")
    Double motoRate,

    @Schema(description = "Total revenue collected in current shift or today", example = "150000.00")
    BigDecimal shiftRevenue,

    @Schema(description = "Average revenue per completed ticket today", example = "5000.00")
    BigDecimal averageTicketRevenue,

    @Schema(description = "Total tickets registered today", example = "45")
    Long totalTicketsToday,

    @Schema(description = "Currently active tickets", example = "15")
    Long activeTickets,

    @Schema(description = "Completed (closed) tickets today", example = "30")
    Long completedTicketsToday,

    @Schema(description = "Average stay in minutes for closed tickets today", example = "75.5")
    Double avgStayMinutes,

    @Schema(description = "Rotation index (total tickets today / total capacity)", example = "0.5")
    Double rotationIndex,

    @Schema(description = "Number of open tickets overdue (mora > 8 hours)", example = "2")
    Long moraCount,

    @Schema(description = "Shift revenue target achievement percentage", example = "104.0")
    Double shiftTargetPercentage,

    @Schema(description = "Real-time list of currently occupied bays with vehicle plates")
    List<OccupiedSlotResponse> occupiedSlotsDetail
) {}
