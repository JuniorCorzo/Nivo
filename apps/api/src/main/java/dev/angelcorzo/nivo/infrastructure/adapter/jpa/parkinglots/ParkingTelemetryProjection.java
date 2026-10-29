package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots;

import java.math.BigDecimal;

public interface ParkingTelemetryProjection {
  Integer getTotalCapacity();

  Integer getOccupiedSlots();

  Integer getCarTotal();

  Integer getCarOccupied();

  Integer getMotoTotal();

  Integer getMotoOccupied();

  Long getMoraCount();

  BigDecimal getShiftRevenue();

  Long getCompletedTicketsToday();

  Long getTotalTicketsToday();

  Double getAvgStayMinutes();
}
