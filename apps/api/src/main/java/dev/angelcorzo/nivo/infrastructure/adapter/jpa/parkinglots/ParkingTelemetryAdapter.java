package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots;

import dev.angelcorzo.nivo.domain.model.parkinglots.OccupiedSlotSummary;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingTelemetry;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingTelemetryGateway;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ParkingTelemetryAdapter implements ParkingTelemetryGateway {

  private final ParkingLotsRepositoryData parkingLotsRepositoryData;

  @Override
  public ParkingTelemetry getTelemetry(final UUID parkingId) {
    final ParkingTelemetryProjection projection = this.parkingLotsRepositoryData.findTelemetryByParkingLotId(parkingId);
    final List<OccupiedSlotProjection> slotProjections = this.parkingLotsRepositoryData
      .findOccupiedSlotsDetailByParkingLotId(parkingId);

    final int totalCapacity = (projection != null && projection.getTotalCapacity() != null)
      ? projection.getTotalCapacity()
      : 0;
    final int occupiedSlots = (projection != null && projection.getOccupiedSlots() != null)
      ? projection.getOccupiedSlots()
      : 0;
    final int carTotal = (projection != null && projection.getCarTotal() != null)
      ? projection.getCarTotal()
      : 0;
    final int carOccupied = (projection != null && projection.getCarOccupied() != null)
      ? projection.getCarOccupied()
      : 0;
    final int motoTotal = (projection != null && projection.getMotoTotal() != null)
      ? projection.getMotoTotal()
      : 0;
    final int motoOccupied = (projection != null && projection.getMotoOccupied() != null)
      ? projection.getMotoOccupied()
      : 0;
    final long moraCount = (projection != null && projection.getMoraCount() != null)
      ? projection.getMoraCount()
      : 0L;
    final BigDecimal shiftRevenue = (projection != null && projection.getShiftRevenue() != null)
      ? projection.getShiftRevenue()
      : BigDecimal.ZERO;
    final long completedTicketsToday = (projection != null && projection.getCompletedTicketsToday() != null)
      ? projection.getCompletedTicketsToday()
      : 0L;
    final long totalTicketsToday = (projection != null && projection.getTotalTicketsToday() != null)
      ? projection.getTotalTicketsToday()
      : 0L;
    final double avgStayMinutes = (projection != null && projection.getAvgStayMinutes() != null)
      ? projection.getAvgStayMinutes()
      : 0.0;

    final int availableSlots = Math.max(0, totalCapacity - occupiedSlots);
    final double occupancyRate = totalCapacity > 0
      ? Math.round((occupiedSlots * 100.0 / totalCapacity) * 10.0) / 10.0
      : 0.0;
    final double carRate = carTotal > 0
      ? Math.round((carOccupied * 100.0 / carTotal) * 10.0) / 10.0
      : 0.0;
    final double motoRate = motoTotal > 0
      ? Math.round((motoOccupied * 100.0 / motoTotal) * 10.0) / 10.0
      : 0.0;
    final long activeTickets = Math.max(0L, totalTicketsToday - completedTicketsToday);
    final BigDecimal averageTicketRevenue = completedTicketsToday > 0
      ? shiftRevenue.divide(BigDecimal.valueOf(completedTicketsToday), 2, RoundingMode.HALF_UP)
      : BigDecimal.ZERO;
    final double rotationIndex = totalCapacity > 0
      ? Math.round((totalTicketsToday * 1.0 / totalCapacity) * 10.0) / 10.0
      : 0.0;

    final List<OccupiedSlotSummary> occupiedSlotsDetail = slotProjections != null
      ? slotProjections.stream()
        .map(sp -> OccupiedSlotSummary.builder()
          .slotNumber(sp.getSlotNumber())
          .zone(sp.getZone())
          .prefix(sp.getPrefix())
          .type(sp.getType())
          .licensePlate(sp.getLicensePlate())
          .build())
        .toList()
      : List.of();

    final double shiftTargetPercentage;
    if (totalCapacity > 0 && shiftRevenue.compareTo(BigDecimal.ZERO) > 0) {
      final BigDecimal target = BigDecimal.valueOf(totalCapacity).multiply(BigDecimal.valueOf(5000));
      if (target.compareTo(BigDecimal.ZERO) > 0) {
        shiftTargetPercentage = Math.round(((shiftRevenue.doubleValue() / target.doubleValue()) * 100.0) * 10.0) / 10.0;
      } else {
        shiftTargetPercentage = 0.0;
      }
    } else {
      shiftTargetPercentage = 0.0;
    }

    return ParkingTelemetry.builder()
      .parkingId(parkingId)
      .totalCapacity(totalCapacity)
      .occupiedSlots(occupiedSlots)
      .availableSlots(availableSlots)
      .occupancyRate(occupancyRate)
      .carTotal(carTotal)
      .carOccupied(carOccupied)
      .carRate(carRate)
      .motoTotal(motoTotal)
      .motoOccupied(motoOccupied)
      .motoRate(motoRate)
      .shiftRevenue(shiftRevenue)
      .averageTicketRevenue(averageTicketRevenue)
      .totalTicketsToday(totalTicketsToday)
      .activeTickets(activeTickets)
      .completedTicketsToday(completedTicketsToday)
      .avgStayMinutes(avgStayMinutes)
      .rotationIndex(rotationIndex)
      .moraCount(moraCount)
      .shiftTargetPercentage(shiftTargetPercentage)
      .occupiedSlotsDetail(occupiedSlotsDetail)
      .build();
  }
}
