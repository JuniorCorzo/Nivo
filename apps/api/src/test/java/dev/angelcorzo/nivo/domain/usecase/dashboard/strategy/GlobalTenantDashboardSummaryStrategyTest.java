package dev.angelcorzo.nivo.domain.usecase.dashboard.strategy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.DashboardSummaryQuery;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
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

  @Test
  @DisplayName("Should return global summary from gateway when found")
  void shouldReturnGlobalSummaryFromGatewayWhenFound() {
    final UUID tenantId = UUID.randomUUID();
    final LocalDate targetDate = LocalDate.now();
    final DashboardSummaryQuery query = DashboardSummaryQuery.builder()
      .tenantId(tenantId)
      .parkingId(null)
      .targetDate(targetDate)
      .build();

    final DashboardSummaryDTO expected = DashboardSummaryDTO.builder()
      .scope("GLOBAL")
      .parkingId(null)
      .totalCapacity(200)
      .occupiedSlots(120)
      .availableSlots(80)
      .occupancyRate(60.0)
      .todayRevenue(new BigDecimal("350000.00"))
      .currency("COP")
      .avgStayMinutes(50.0)
      .totalTickets(80L)
      .activeTickets(25L)
      .completedTickets(55L)
      .revenueDeltaPercentage(25.0)
      .avgStayDeltaMinutes(-5.0)
      .digitalPaymentRatio(60.0)
      .gracePeriodMinutes(null)
      .build();

    when(dailyGateway.findDashboardSummary(tenantId, null, targetDate, 7))
      .thenReturn(Optional.of(expected));

    final DashboardSummaryDTO result = strategy.execute(query);

    assertThat(result).isSameAs(expected);
  }

  @Test
  @DisplayName("Should return zero global summary when gateway returns empty")
  void shouldReturnZeroGlobalSummaryWhenGatewayReturnsEmpty() {
    final UUID tenantId = UUID.randomUUID();
    final LocalDate targetDate = LocalDate.now();
    final DashboardSummaryQuery query = DashboardSummaryQuery.builder()
      .tenantId(tenantId)
      .parkingId(null)
      .targetDate(targetDate)
      .build();

    when(dailyGateway.findDashboardSummary(tenantId, null, targetDate, 7))
      .thenReturn(Optional.empty());

    final DashboardSummaryDTO result = strategy.execute(query);

    assertThat(result).isNotNull();
    assertThat(result.getScope()).isEqualTo("GLOBAL");
    assertThat(result.getParkingId()).isNull();
    assertThat(result.getTotalCapacity()).isEqualTo(0);
    assertThat(result.getOccupiedSlots()).isEqualTo(0);
    assertThat(result.getAvailableSlots()).isEqualTo(0);
    assertThat(result.getOccupancyRate()).isEqualTo(0.0);
    assertThat(result.getTodayRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.getCurrency()).isEqualTo("COP");
    assertThat(result.getGracePeriodMinutes()).isNull();
  }
}
