package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import dev.angelcorzo.nivo.domain.usecase.dashboard.strategy.DashboardSummaryStrategy;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetDashboardSummaryUseCase {

  private final List<DashboardSummaryStrategy> strategies;
  private final AuthenticationContextGateway authenticationContext;

  public DashboardSummaryDTO execute(final UUID parkingId) {
    return execute(parkingId, LocalDate.now());
  }

  public DashboardSummaryDTO execute(final UUID parkingId, final LocalDate targetDate) {
    final UUID tenantId = authenticationContext.getCurrentTenantId();
    return execute(tenantId, parkingId, targetDate);
  }

  public DashboardSummaryDTO execute(final UUID tenantId, final UUID parkingId) {
    return execute(tenantId, parkingId, LocalDate.now());
  }

  public DashboardSummaryDTO execute(final UUID tenantId, final UUID parkingId, final LocalDate targetDate) {
    final DashboardSummaryQuery query = DashboardSummaryQuery.builder()
      .tenantId(tenantId)
      .parkingId(parkingId)
      .targetDate(targetDate)
      .build();
    return execute(query);
  }

  public DashboardSummaryDTO execute(final DashboardSummaryQuery query) {
    return strategies.stream()
      .filter(strategy -> strategy.supports(query))
      .findFirst()
      .orElseThrow(() -> new IllegalStateException("No strategy found for dashboard query: " + query))
      .execute(query);
  }
}
