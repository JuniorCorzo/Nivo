package dev.angelcorzo.nivo.domain.usecase.dashboard;

import java.time.LocalDate;
import java.util.UUID;
import lombok.Builder;

@Builder
public record DashboardSummaryQuery(
  UUID tenantId,
  UUID parkingId,
  LocalDate targetDate) {
  public DashboardSummaryQuery {
    if (targetDate == null) {
      targetDate = LocalDate.now();
    }
  }
}
