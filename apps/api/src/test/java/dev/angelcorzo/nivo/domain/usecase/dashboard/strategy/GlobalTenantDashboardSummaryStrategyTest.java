package dev.angelcorzo.nivo.domain.usecase.dashboard.strategy;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.DashboardSummaryQuery;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GlobalTenantDashboardSummaryStrategyTest {

  @Mock
  private DailySummaryGateway dailyGateway;

  @Mock
  private HourlyOccupancyGateway hourlyGateway;

  @Mock
  private ParkingLotsRepository parkingLotsRepository;

  private GlobalTenantDashboardSummaryStrategy strategy;

  @BeforeEach
  void setUp() {
    strategy = new GlobalTenantDashboardSummaryStrategy(dailyGateway, hourlyGateway, parkingLotsRepository);
  }

  @Test
  @DisplayName("Should support query when parkingId is null")
  void shouldSupportWhenParkingIdNull() {
    final DashboardSummaryQuery query = DashboardSummaryQuery.builder()
      .tenantId(UUID.randomUUID())
      .parkingId(null)
      .build();

    assertThat(strategy.supports(query)).isTrue();
  }

  @Test
  @DisplayName("Should not support query when parkingId is present")
  void shouldNotSupportWhenParkingIdPresent() {
    final DashboardSummaryQuery query = DashboardSummaryQuery.builder()
      .tenantId(UUID.randomUUID())
      .parkingId(UUID.randomUUID())
      .build();

    assertThat(strategy.supports(query)).isFalse();
    assertThat(strategy.supports(null)).isFalse();
  }
}
