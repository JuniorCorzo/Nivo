package dev.angelcorzo.nivo.domain.usecase.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import dev.angelcorzo.nivo.domain.usecase.dashboard.strategy.GlobalTenantDashboardSummaryStrategy;
import dev.angelcorzo.nivo.domain.usecase.dashboard.strategy.SingleParkingDashboardSummaryStrategy;
import java.math.BigDecimal;
import java.time.LocalDate;
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
    final SingleParkingDashboardSummaryStrategy singleParkingStrategy =
      new SingleParkingDashboardSummaryStrategy(dailyGateway, hourlyGateway, parkingLotsRepository);
    final GlobalTenantDashboardSummaryStrategy globalTenantStrategy =
      new GlobalTenantDashboardSummaryStrategy(dailyGateway, hourlyGateway, parkingLotsRepository);
    useCase = new GetDashboardSummaryUseCase(
      List.of(singleParkingStrategy, globalTenantStrategy), authenticationContext);
  }

  @Test
  @DisplayName("Should return single parking summary when valid parkingId is requested")
  void shouldReturnSingleParkingSummaryWhenValidParkingRequested() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final LocalDate today = LocalDate.now();
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

    final DashboardSummaryDTO expectedDto = DashboardSummaryDTO.builder()
      .scope("SINGLE")
      .parkingId(parkingId)
      .totalCapacity(100)
      .occupiedSlots(50)
      .availableSlots(50)
      .occupancyRate(50.0)
      .todayRevenue(new BigDecimal("120000.00"))
      .currency("COP")
      .avgStayMinutes(45.0)
      .totalTickets(40L)
      .activeTickets(10L)
      .completedTickets(30L)
      .revenueDeltaPercentage(20.0)
      .avgStayDeltaMinutes(-5.0)
      .digitalPaymentRatio(75.0)
      .gracePeriodMinutes(15)
      .build();

    when(dailyGateway.findDashboardSummary(tenantId, parkingId, today, 7))
      .thenReturn(Optional.of(expectedDto));

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
  @DisplayName("Should return global tenant summary when parkingId is null")
  void shouldReturnGlobalTenantSummaryWhenParkingIdIsNull() {
    final UUID tenantId = UUID.randomUUID();
    final LocalDate today = LocalDate.now();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final DashboardSummaryDTO expectedDto = DashboardSummaryDTO.builder()
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

    when(dailyGateway.findDashboardSummary(tenantId, null, today, 7))
      .thenReturn(Optional.of(expectedDto));

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

    assertThatThrownBy(() -> useCase.execute(nonExistentParkingId))
      .isInstanceOf(ParkingNotExistsException.class);
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

    assertThatThrownBy(() -> useCase.execute(parkingId))
      .isInstanceOf(ParkingNotExistsException.class);
  }

  @Test
  @DisplayName("Should fallback to zero summary when gateway returns empty for single parking")
  void shouldFallbackToZeroSummaryWhenGatewayReturnsEmptyForSingleParking() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final LocalDate today = LocalDate.now();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final TenantReference tenant = TenantReference.builder().id(tenantId).build();
    final ParkingLotPolicy policy = ParkingLotPolicy.builder().gracePeriodMinutes(15).build();
    final ParkingLots parkingLot = ParkingLots.builder()
      .id(parkingId)
      .name("Sede Zero")
      .currency("COP")
      .tenant(tenant)
      .policy(policy)
      .build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    when(dailyGateway.findDashboardSummary(tenantId, parkingId, today, 7))
      .thenReturn(Optional.empty());

    final DashboardSummaryDTO summary = useCase.execute(parkingId);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("SINGLE");
    assertThat(summary.getParkingId()).isEqualTo(parkingId);
    assertThat(summary.getTotalCapacity()).isEqualTo(0);
    assertThat(summary.getOccupiedSlots()).isEqualTo(0);
    assertThat(summary.getAvailableSlots()).isEqualTo(0);
    assertThat(summary.getOccupancyRate()).isEqualTo(0.0);
    assertThat(summary.getTodayRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(summary.getCurrency()).isEqualTo("COP");
    assertThat(summary.getGracePeriodMinutes()).isEqualTo(15);
  }

  @Test
  @DisplayName("Should fallback to zero summary when gateway returns empty for global tenant")
  void shouldFallbackToZeroSummaryWhenGatewayReturnsEmptyForGlobalTenant() {
    final UUID tenantId = UUID.randomUUID();
    final LocalDate today = LocalDate.now();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    when(dailyGateway.findDashboardSummary(tenantId, null, today, 7))
      .thenReturn(Optional.empty());

    final DashboardSummaryDTO summary = useCase.execute((UUID) null);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("GLOBAL");
    assertThat(summary.getParkingId()).isNull();
    assertThat(summary.getTotalCapacity()).isEqualTo(0);
    assertThat(summary.getOccupiedSlots()).isEqualTo(0);
    assertThat(summary.getAvailableSlots()).isEqualTo(0);
    assertThat(summary.getOccupancyRate()).isEqualTo(0.0);
    assertThat(summary.getTodayRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(summary.getCurrency()).isEqualTo("COP");
    assertThat(summary.getGracePeriodMinutes()).isNull();
  }

  @Test
  @DisplayName("Should execute query with custom target date and delegate to gateway")
  void shouldExecuteWithCustomTargetDate() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final LocalDate targetDate = LocalDate.of(2026, 10, 15);

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    final TenantReference tenant = TenantReference.builder().id(tenantId).build();
    final ParkingLots parkingLot = ParkingLots.builder().id(parkingId).name("Sede Fecha").tenant(tenant).build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    final DashboardSummaryDTO expectedDto = DashboardSummaryDTO.builder()
      .scope("SINGLE")
      .parkingId(parkingId)
      .todayRevenue(new BigDecimal("50000.00"))
      .digitalPaymentRatio(100.0)
      .build();

    when(dailyGateway.findDashboardSummary(tenantId, parkingId, targetDate, 7))
      .thenReturn(Optional.of(expectedDto));

    final DashboardSummaryDTO summary = useCase.execute(parkingId, targetDate);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("SINGLE");
    assertThat(summary.getTodayRevenue()).isEqualByComparingTo(new BigDecimal("50000.00"));
    assertThat(summary.getDigitalPaymentRatio()).isEqualTo(100.0);
    verify(dailyGateway).findDashboardSummary(tenantId, parkingId, targetDate, 7);
  }
}
