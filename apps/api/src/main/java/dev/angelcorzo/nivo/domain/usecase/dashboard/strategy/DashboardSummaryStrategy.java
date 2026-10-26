package dev.angelcorzo.nivo.domain.usecase.dashboard.strategy;

import dev.angelcorzo.nivo.domain.usecase.dashboard.DashboardSummaryQuery;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;

public interface DashboardSummaryStrategy {

  boolean supports(DashboardSummaryQuery query);

  DashboardSummaryDTO execute(DashboardSummaryQuery query);
}
