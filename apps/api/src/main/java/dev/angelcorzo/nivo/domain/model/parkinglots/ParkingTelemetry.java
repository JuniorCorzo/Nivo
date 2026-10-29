package dev.angelcorzo.nivo.domain.model.parkinglots;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.Builder;

/**
 * Real-time operational telemetry and metrics for a parking lot.
 */
@Builder(toBuilder = true)
public record ParkingTelemetry(
    UUID parkingId,
    Integer totalCapacity,
    Integer occupiedSlots,
    Integer availableSlots,
    Double occupancyRate,
    Integer carTotal,
    Integer carOccupied,
    Double carRate,
    Integer motoTotal,
    Integer motoOccupied,
    Double motoRate,
    BigDecimal shiftRevenue,
    BigDecimal averageTicketRevenue,
    Long totalTicketsToday,
    Long activeTickets,
    Long completedTicketsToday,
    Double avgStayMinutes,
    Double rotationIndex,
    Long moraCount,
    Double shiftTargetPercentage,
    List<OccupiedSlotSummary> occupiedSlotsDetail
) {}
