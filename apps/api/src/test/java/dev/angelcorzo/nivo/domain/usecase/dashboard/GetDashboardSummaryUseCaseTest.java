package dev.angelcorzo.nivo.domain.usecase.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GetDashboardSummaryUseCaseTest {

  @Mock
  private DailySummaryGateway dailyGateway;

  @Mock
  private HourlyOccupancyGateway hourlyGateway;

  @Mock
  private ParkingLotsRepository parkingLotsRepository;

  @Mock
  private AuthenticationContextGateway authenticationContext;

  private GetDashboardSummaryUseCase useCase;

  @BeforeEach
  void setUp() {
    final dev.angelcorzo.nivo.domain.usecase.dashboard.strategy.SingleParkingDashboardSummaryStrategy singleParkingStrategy = new dev.angelcorzo.nivo.domain.usecase.dashboard.strategy.SingleParkingDashboardSummaryStrategy(
      dailyGateway, hourlyGateway, parkingLotsRepository);
    final dev.angelcorzo.nivo.domain.usecase.dashboard.strategy.GlobalTenantDashboardSummaryStrategy globalTenantStrategy = new dev.angelcorzo.nivo.domain.usecase.dashboard.strategy.GlobalTenantDashboardSummaryStrategy(
      dailyGateway, hourlyGateway, parkingLotsRepository);
    useCase = new GetDashboardSummaryUseCase(List.of(singleParkingStrategy, globalTenantStrategy),
      authenticationContext);
  }

  @Test
  @DisplayName("Should return single parking summary with deltas and ratios when valid parkingId is requested")
  void shouldReturnSingleParkingSummaryWhenValidParkingRequested() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final TenantReference tenant = TenantReference.builder().id(tenantId).build();
    final ParkingLotPolicy policy = ParkingLotPolicy.builder().gracePeriodMinutes(15).build();
    final ParkingLots parkingLot = ParkingLots.builder()
      .id(parkingId)
      .name("Sede Central")
      .tenant(tenant)
      .policy(policy)
      .build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    final LocalDate today = LocalDate.now();
    final LocalDate previousWeek = today.minusDays(7);

    final DailySummaryModel dailyModel = DailySummaryModel.builder()
      .parkingLotId(parkingId)
      .tenantId(tenantId)
      .summaryDate(today)
      .totalTickets(40L)
      .completedTickets(30L)
      .ongoingTickets(10L)
      .totalRevenue(new BigDecimal("120000.00"))
      .digitalRevenue(new BigDecimal("90000.00"))
      .avgDurationMinutes(45.0)
      .currency("COP")
      .build();

    final DailySummaryModel prevModel = DailySummaryModel.builder()
      .parkingLotId(parkingId)
      .tenantId(tenantId)
      .summaryDate(previousWeek)
      .totalTickets(35L)
      .completedTickets(28L)
      .ongoingTickets(7L)
      .totalRevenue(new BigDecimal("100000.00"))
      .digitalRevenue(new BigDecimal("50000.00"))
      .avgDurationMinutes(50.0)
      .currency("COP")
      .build();

    when(dailyGateway.findByParkingLotIdAndSummaryDates(eq(parkingId), eq(List.of(today, previousWeek))))
      .thenReturn(List.of(dailyModel, prevModel));

    final HourlyOccupancyModel hourlyModel = HourlyOccupancyModel.builder()
      .parkingLotId(parkingId)
      .tenantId(tenantId)
      .hourBucket(OffsetDateTime.now())
      .totalCapacity(100L)
      .estimatedOccupancyRate(50.0)
      .build();
    when(hourlyGateway.findLatestByParkingLotId(parkingId)).thenReturn(Optional.of(hourlyModel));

    final DashboardSummaryDTO summary = useCase.execute(parkingId);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("SINGLE");
    assertThat(summary.getParkingId()).isEqualTo(parkingId);
    assertThat(summary.getTotalCapacity()).isEqualTo(100);
    assertThat(summary.getOccupiedSlots()).isEqualTo(50);
    assertThat(summary.getAvailableSlots()).isEqualTo(50);
    assertThat(summary.getOccupancyRate()).isEqualTo(50.0);
    assertThat(summary.getTodayRevenue()).isEqualByComparingTo(new BigDecimal("120000.00"));
    assertThat(summary.getTotalTickets()).isEqualTo(40L);
    assertThat(summary.getActiveTickets()).isEqualTo(10L);
    assertThat(summary.getCompletedTickets()).isEqualTo(30L);
    assertThat(summary.getRevenueDeltaPercentage()).isEqualTo(20.0);
    assertThat(summary.getAvgStayDeltaMinutes()).isEqualTo(-5.0);
    assertThat(summary.getDigitalPaymentRatio()).isEqualTo(75.0);
    assertThat(summary.getGracePeriodMinutes()).isEqualTo(15);
  }

  @Test
  @DisplayName("Should return global tenant summary with aggregated deltas when parkingId is null")
  void shouldReturnGlobalTenantSummaryWhenParkingIdIsNull() {
    final UUID tenantId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final LocalDate today = LocalDate.now();
    final LocalDate previousWeek = today.minusDays(7);

    final DailySummaryModel daily1 = DailySummaryModel.builder()
      .parkingLotId(UUID.randomUUID())
      .tenantId(tenantId)
      .summaryDate(today)
      .totalTickets(50L)
      .completedTickets(35L)
      .ongoingTickets(15L)
      .totalRevenue(new BigDecimal("200000.00"))
      .digitalRevenue(new BigDecimal("150000.00"))
      .avgDurationMinutes(60.0)
      .currency("COP")
      .build();

    final DailySummaryModel daily2 = DailySummaryModel.builder()
      .parkingLotId(UUID.randomUUID())
      .tenantId(tenantId)
      .summaryDate(today)
      .totalTickets(30L)
      .completedTickets(20L)
      .ongoingTickets(10L)
      .totalRevenue(new BigDecimal("150000.00"))
      .digitalRevenue(new BigDecimal("60000.00"))
      .avgDurationMinutes(40.0)
      .currency("COP")
      .build();

    final DailySummaryModel prevDaily = DailySummaryModel.builder()
      .parkingLotId(UUID.randomUUID())
      .tenantId(tenantId)
      .summaryDate(previousWeek)
      .totalTickets(70L)
      .completedTickets(50L)
      .ongoingTickets(20L)
      .totalRevenue(new BigDecimal("280000.00"))
      .digitalRevenue(new BigDecimal("140000.00"))
      .avgDurationMinutes(55.0)
      .currency("COP")
      .build();

    when(dailyGateway.findAllByTenantIdAndSummaryDates(eq(tenantId), eq(List.of(today, previousWeek))))
      .thenReturn(List.of(daily1, daily2, prevDaily));

    final HourlyOccupancyModel hourly1 = HourlyOccupancyModel.builder()
      .totalCapacity(100L)
      .estimatedOccupancyRate(50.0)
      .build();
    final HourlyOccupancyModel hourly2 = HourlyOccupancyModel.builder()
      .totalCapacity(100L)
      .estimatedOccupancyRate(70.0)
      .build();
    when(hourlyGateway.findByTenantId(tenantId)).thenReturn(List.of(hourly1, hourly2));

    final DashboardSummaryDTO summary = useCase.execute((UUID) null);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("GLOBAL");
    assertThat(summary.getParkingId()).isNull();
    assertThat(summary.getTotalCapacity()).isEqualTo(200);
    assertThat(summary.getOccupiedSlots()).isEqualTo(120);
    assertThat(summary.getAvailableSlots()).isEqualTo(80);
    assertThat(summary.getOccupancyRate()).isEqualTo(60.0);
    assertThat(summary.getTodayRevenue()).isEqualByComparingTo(new BigDecimal("350000.00"));
    assertThat(summary.getTotalTickets()).isEqualTo(80L);
    assertThat(summary.getActiveTickets()).isEqualTo(25L);
    assertThat(summary.getCompletedTickets()).isEqualTo(55L);
    assertThat(summary.getAvgStayMinutes()).isEqualTo(50.0);
    assertThat(summary.getRevenueDeltaPercentage()).isEqualTo(25.0);
    assertThat(summary.getAvgStayDeltaMinutes()).isEqualTo(-5.0);
    assertThat(summary.getDigitalPaymentRatio()).isEqualTo(60.0);
    assertThat(summary.getGracePeriodMinutes()).isNull();
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking lot does not exist")
  void shouldThrowParkingNotExistsExceptionWhenParkingNotFound() {
    final UUID tenantId = UUID.randomUUID();
    final UUID nonExistentParkingId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(parkingLotsRepository.findById(nonExistentParkingId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(nonExistentParkingId)).isInstanceOf(ParkingNotExistsException.class);
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking belongs to a different tenant")
  void shouldThrowParkingNotExistsExceptionWhenParkingBelongsToDifferentTenant() {
    final UUID tenantId = UUID.randomUUID();
    final UUID foreignTenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final TenantReference foreignTenant = TenantReference.builder().id(foreignTenantId).build();
    final ParkingLots foreignParkingLot = ParkingLots.builder().id(parkingId).tenant(foreignTenant).build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(foreignParkingLot));

    assertThatThrownBy(() -> useCase.execute(parkingId)).isInstanceOf(ParkingNotExistsException.class);
  }

  @Test
  @DisplayName("Should compute global tenant summary from parking lots live occupancy when available")
  void shouldComputeGlobalSummaryFromParkingLotsWhenAvailable() {
    final UUID tenantId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final ParkingLotListItem parking1 = ParkingLotListItem.builder()
      .id(UUID.randomUUID())
      .name("Sede A")
      .totalCapacity(100L)
      .occuppationRate(40.0)
      .build();
    final ParkingLotListItem parking2 = ParkingLotListItem.builder()
      .id(UUID.randomUUID())
      .name("Sede B")
      .totalCapacity(100L)
      .occuppationRate(60.0)
      .build();

    when(parkingLotsRepository.findByTenantId(tenantId)).thenReturn(List.of(parking1, parking2));

    final LocalDate today = LocalDate.now();
    final LocalDate previousWeek = today.minusDays(7);
    final DailySummaryModel daily = DailySummaryModel.builder()
      .parkingLotId(parking1.id())
      .tenantId(tenantId)
      .summaryDate(today)
      .totalTickets(50L)
      .completedTickets(35L)
      .ongoingTickets(15L)
      .totalRevenue(new BigDecimal("100000.00"))
      .digitalRevenue(new BigDecimal("80000.00"))
      .avgDurationMinutes(45.0)
      .currency("COP")
      .build();
    when(dailyGateway.findAllByTenantIdAndSummaryDates(eq(tenantId), eq(List.of(today, previousWeek))))
      .thenReturn(List.of(daily));

    final DashboardSummaryDTO summary = useCase.execute((UUID) null);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("GLOBAL");
    assertThat(summary.getTotalCapacity()).isEqualTo(200);
    assertThat(summary.getOccupiedSlots()).isEqualTo(100);
    assertThat(summary.getAvailableSlots()).isEqualTo(100);
    assertThat(summary.getOccupancyRate()).isEqualTo(50.0);
    assertThat(summary.getDigitalPaymentRatio()).isEqualTo(80.0);
  }

  @Test
  @DisplayName("Should compute single parking summary from parking lots live occupancy when available")
  void shouldComputeSingleParkingSummaryFromParkingLotsWhenAvailable() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final TenantReference tenant = TenantReference.builder().id(tenantId).build();
    final ParkingLots parkingLot = ParkingLots.builder().id(parkingId).name("Sede Express").tenant(tenant).build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    final ParkingLotListItem parkingItem = ParkingLotListItem.builder()
      .id(parkingId)
      .name("Sede Express")
      .totalCapacity(80L)
      .occuppationRate(25.0)
      .build();
    when(parkingLotsRepository.findByTenantId(tenantId)).thenReturn(List.of(parkingItem));
    when(hourlyGateway.findLatestByParkingLotId(parkingId)).thenReturn(Optional.empty());

    final LocalDate today = LocalDate.now();
    final LocalDate previousWeek = today.minusDays(7);
    when(dailyGateway.findByParkingLotIdAndSummaryDates(eq(parkingId), eq(List.of(today, previousWeek))))
      .thenReturn(List.of());
    when(dailyGateway.findAllByTenantIdAndParkingLotId(tenantId, parkingId)).thenReturn(List.of());

    final DashboardSummaryDTO summary = useCase.execute(parkingId);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("SINGLE");
    assertThat(summary.getTotalCapacity()).isEqualTo(80);
    assertThat(summary.getOccupiedSlots()).isEqualTo(20);
    assertThat(summary.getAvailableSlots()).isEqualTo(60);
    assertThat(summary.getOccupancyRate()).isEqualTo(25.0);
    assertThat(summary.getDigitalPaymentRatio()).isEqualTo(0.0);
    assertThat(summary.getGracePeriodMinutes()).isEqualTo(0);
  }

  @Test
  @DisplayName("Should fallback to historical summaries when today summary is empty for single parking")
  void shouldFallbackToHistoricalSummariesWhenTodaySummaryIsEmpty() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final TenantReference tenant = TenantReference.builder().id(tenantId).build();
    final ParkingLotPolicy policy = ParkingLotPolicy.builder().gracePeriodMinutes(15).build();
    final ParkingLots parkingLot = ParkingLots.builder()
      .id(parkingId)
      .name("Sede Fallback")
      .tenant(tenant)
      .policy(policy)
      .build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    final LocalDate today = LocalDate.now();
    final LocalDate previousWeek = today.minusDays(7);
    when(dailyGateway.findByParkingLotIdAndSummaryDates(eq(parkingId), eq(List.of(today, previousWeek))))
      .thenReturn(List.of());

    final ParkingLotListItem parkingItem = ParkingLotListItem.builder()
      .id(parkingId)
      .name("Sede Fallback")
      .totalCapacity(50L)
      .occuppationRate(0.0)
      .currency("COP")
      .build();
    when(parkingLotsRepository.findByTenantId(tenantId)).thenReturn(List.of(parkingItem));
    when(hourlyGateway.findLatestByParkingLotId(parkingId)).thenReturn(Optional.empty());

    final DailySummaryModel s1 = DailySummaryModel.builder()
      .parkingLotId(parkingId)
      .tenantId(tenantId)
      .summaryDate(today.minusDays(2))
      .totalRevenue(new BigDecimal("50000.00"))
      .digitalRevenue(new BigDecimal("25000.00"))
      .totalTickets(10L)
      .ongoingTickets(3L)
      .completedTickets(7L)
      .avgDurationMinutes(30.0)
      .currency("COP")
      .build();

    final DailySummaryModel s2 = DailySummaryModel.builder()
      .parkingLotId(parkingId)
      .tenantId(tenantId)
      .summaryDate(today.minusDays(1))
      .totalRevenue(new BigDecimal("70000.00"))
      .digitalRevenue(new BigDecimal("35000.00"))
      .totalTickets(15L)
      .ongoingTickets(2L)
      .completedTickets(13L)
      .avgDurationMinutes(50.0)
      .currency("COP")
      .build();

    when(dailyGateway.findAllByTenantIdAndParkingLotId(tenantId, parkingId)).thenReturn(List.of(s1, s2));

    final DashboardSummaryDTO summary = useCase.execute(parkingId);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("SINGLE");
    assertThat(summary.getParkingId()).isEqualTo(parkingId);
    assertThat(summary.getTotalCapacity()).isEqualTo(50);
    assertThat(summary.getOccupiedSlots()).isEqualTo(5);
    assertThat(summary.getAvailableSlots()).isEqualTo(45);
    assertThat(summary.getTodayRevenue()).isEqualByComparingTo(new BigDecimal("120000.00"));
    assertThat(summary.getTotalTickets()).isEqualTo(25L);
    assertThat(summary.getActiveTickets()).isEqualTo(5L);
    assertThat(summary.getCompletedTickets()).isEqualTo(20L);
    assertThat(summary.getAvgStayMinutes()).isEqualTo(40.0);
    assertThat(summary.getCurrency()).isEqualTo("COP");
    assertThat(summary.getDigitalPaymentRatio()).isEqualTo(50.0);
    assertThat(summary.getGracePeriodMinutes()).isEqualTo(15);
  }

  @Test
  @DisplayName("Should execute single query with target date and target date minus 7 days when custom date is passed")
  void shouldExecuteWithCustomTargetDate() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final LocalDate targetDate = LocalDate.of(2026, 10, 15);
    final LocalDate expectedPrevDate = LocalDate.of(2026, 10, 8);

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    final TenantReference tenant = TenantReference.builder().id(tenantId).build();
    final ParkingLots parkingLot = ParkingLots.builder().id(parkingId).name("Sede Fecha").tenant(tenant).build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    final DailySummaryModel dailyModel = DailySummaryModel.builder()
      .parkingLotId(parkingId)
      .tenantId(tenantId)
      .summaryDate(targetDate)
      .totalTickets(10L)
      .completedTickets(10L)
      .ongoingTickets(0L)
      .totalRevenue(new BigDecimal("50000.00"))
      .digitalRevenue(new BigDecimal("50000.00"))
      .avgDurationMinutes(30.0)
      .currency("COP")
      .build();

    when(dailyGateway.findByParkingLotIdAndSummaryDates(eq(parkingId), eq(List.of(targetDate, expectedPrevDate))))
      .thenReturn(List.of(dailyModel));

    final DashboardSummaryDTO summary = useCase.execute(parkingId, targetDate);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("SINGLE");
    assertThat(summary.getTodayRevenue()).isEqualByComparingTo(new BigDecimal("50000.00"));
    assertThat(summary.getDigitalPaymentRatio()).isEqualTo(100.0);
    verify(dailyGateway).findByParkingLotIdAndSummaryDates(parkingId, List.of(targetDate, expectedPrevDate));
  }

  @Test
  @DisplayName("Should handle edge cases such as zero revenue and missing previous summary without division by zero")
  void shouldHandleZeroRevenueEdgeCasesGracefully() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final LocalDate today = LocalDate.now();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    final TenantReference tenant = TenantReference.builder().id(tenantId).build();
    final ParkingLots parkingLot = ParkingLots.builder().id(parkingId).name("Sede Cero").tenant(tenant).build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    // Current summary has 0 total revenue, previous summary has 0 total revenue
    final DailySummaryModel dailyModel = DailySummaryModel.builder()
      .parkingLotId(parkingId)
      .tenantId(tenantId)
      .summaryDate(today)
      .totalRevenue(BigDecimal.ZERO)
      .digitalRevenue(BigDecimal.ZERO)
      .avgDurationMinutes(null)
      .build();

    final DailySummaryModel prevModel = DailySummaryModel.builder()
      .parkingLotId(parkingId)
      .tenantId(tenantId)
      .summaryDate(today.minusDays(7))
      .totalRevenue(BigDecimal.ZERO)
      .avgDurationMinutes(null)
      .build();

    when(dailyGateway.findByParkingLotIdAndSummaryDates(eq(parkingId), eq(List.of(today, today.minusDays(7)))))
      .thenReturn(List.of(dailyModel, prevModel));

    final DashboardSummaryDTO summary = useCase.execute(parkingId);

    assertThat(summary.getRevenueDeltaPercentage()).isEqualTo(0.0);
    assertThat(summary.getAvgStayDeltaMinutes()).isNull();
    assertThat(summary.getDigitalPaymentRatio()).isEqualTo(0.0);
  }
}
