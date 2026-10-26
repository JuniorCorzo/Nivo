package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.projection;

import java.math.BigDecimal;
import java.util.UUID;

public interface DashboardSummaryProjection {

  String getScope();

  UUID getParkingId();

  Integer getTotalCapacity();

  Integer getOccupiedSlots();

  Integer getAvailableSlots();

  Double getOccupancyRate();

  BigDecimal getTodayRevenue();

  String getCurrency();

  Double getAvgStayMinutes();

  Long getTotalTickets();

  Long getActiveTickets();

  Long getCompletedTickets();

  Double getRevenueDeltaPercentage();

  Double getAvgStayDeltaMinutes();

  Double getDigitalPaymentRatio();

  Integer getGracePeriodMinutes();
}
