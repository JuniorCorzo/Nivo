package dev.angelcorzo.nivo.domain.usecase.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
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
    useCase = new GetDashboardSummaryUseCase(
        dailyGateway, hourlyGateway, parkingLotsRepository, authenticationContext);
  }

  @Test
  @DisplayName("Should return single parking summary when valid parkingId is requested")
  void shouldReturnSingleParkingSummaryWhenValidParkingRequested() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final TenantReference tenant = TenantReference.builder().id(tenantId).build();
    final ParkingLots parkingLot = ParkingLots.builder()
        .id(parkingId)
        .name("Sede Central")
        .tenant(tenant)
        .build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    final DailySummaryModel dailyModel = DailySummaryModel.builder()
        .parkingLotId(parkingId)
        .tenantId(tenantId)
        .summaryDate(LocalDate.now())
        .totalTickets(40L)
        .completedTickets(30L)
        .ongoingTickets(10L)
        .totalRevenue(new BigDecimal("120000.00"))
        .avgDurationMinutes(45.0)
        .currency("COP")
        .build();
    when(dailyGateway.findByParkingLotIdAndSummaryDate(eq(parkingId), any(LocalDate.class)))
        .thenReturn(Optional.of(dailyModel));

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
  }

  @Test
  @DisplayName("Should return global tenant summary when parkingId is null")
  void shouldReturnGlobalTenantSummaryWhenParkingIdIsNull() {
    final UUID tenantId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final DailySummaryModel daily1 = DailySummaryModel.builder()
        .parkingLotId(UUID.randomUUID())
        .tenantId(tenantId)
        .summaryDate(LocalDate.now())
        .totalTickets(50L)
        .completedTickets(35L)
        .ongoingTickets(15L)
        .totalRevenue(new BigDecimal("200000.00"))
        .avgDurationMinutes(60.0)
        .currency("COP")
        .build();

    final DailySummaryModel daily2 = DailySummaryModel.builder()
        .parkingLotId(UUID.randomUUID())
        .tenantId(tenantId)
        .summaryDate(LocalDate.now())
        .totalTickets(30L)
        .completedTickets(20L)
        .ongoingTickets(10L)
        .totalRevenue(new BigDecimal("150000.00"))
        .avgDurationMinutes(40.0)
        .currency("COP")
        .build();

    when(dailyGateway.findAllByTenantIdAndSummaryDate(eq(tenantId), any(LocalDate.class)))
        .thenReturn(List.of(daily1, daily2));

    final HourlyOccupancyModel hourly1 = HourlyOccupancyModel.builder()
        .totalCapacity(100L)
        .estimatedOccupancyRate(50.0)
        .build();
    final HourlyOccupancyModel hourly2 = HourlyOccupancyModel.builder()
        .totalCapacity(100L)
        .estimatedOccupancyRate(70.0)
        .build();
    when(hourlyGateway.findByTenantId(tenantId)).thenReturn(List.of(hourly1, hourly2));

    final DashboardSummaryDTO summary = useCase.execute(null);

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
    final ParkingLots foreignParkingLot = ParkingLots.builder()
        .id(parkingId)
        .tenant(foreignTenant)
        .build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(foreignParkingLot));

    assertThatThrownBy(() -> useCase.execute(parkingId))
        .isInstanceOf(ParkingNotExistsException.class);
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

    final DailySummaryModel daily = DailySummaryModel.builder()
        .parkingLotId(parking1.id())
        .tenantId(tenantId)
        .summaryDate(LocalDate.now())
        .totalTickets(50L)
        .completedTickets(35L)
        .ongoingTickets(15L)
        .totalRevenue(new BigDecimal("100000.00"))
        .avgDurationMinutes(45.0)
        .currency("COP")
        .build();
    when(dailyGateway.findAllByTenantIdAndSummaryDate(eq(tenantId), any(LocalDate.class)))
        .thenReturn(List.of(daily));

    final DashboardSummaryDTO summary = useCase.execute(null);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("GLOBAL");
    assertThat(summary.getTotalCapacity()).isEqualTo(200);
    assertThat(summary.getOccupiedSlots()).isEqualTo(100);
    assertThat(summary.getAvailableSlots()).isEqualTo(100);
    assertThat(summary.getOccupancyRate()).isEqualTo(50.0);
  }

  @Test
  @DisplayName("Should compute single parking summary from parking lots live occupancy when available")
  void shouldComputeSingleParkingSummaryFromParkingLotsWhenAvailable() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final TenantReference tenant = TenantReference.builder().id(tenantId).build();
    final ParkingLots parkingLot = ParkingLots.builder()
        .id(parkingId)
        .name("Sede Express")
        .tenant(tenant)
        .build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    final ParkingLotListItem parkingItem = ParkingLotListItem.builder()
        .id(parkingId)
        .name("Sede Express")
        .totalCapacity(80L)
        .occuppationRate(25.0)
        .build();
    when(parkingLotsRepository.findByTenantId(tenantId)).thenReturn(List.of(parkingItem));
    when(hourlyGateway.findLatestByParkingLotId(parkingId)).thenReturn(Optional.empty());

    final DashboardSummaryDTO summary = useCase.execute(parkingId);

    assertThat(summary).isNotNull();
    assertThat(summary.getScope()).isEqualTo("SINGLE");
    assertThat(summary.getTotalCapacity()).isEqualTo(80);
    assertThat(summary.getOccupiedSlots()).isEqualTo(20);
    assertThat(summary.getAvailableSlots()).isEqualTo(60);
    assertThat(summary.getOccupancyRate()).isEqualTo(25.0);
  }

  @Test
  @DisplayName("Should fallback to historical summaries when today summary is empty for single parking")
  void shouldFallbackToHistoricalSummariesWhenTodaySummaryIsEmpty() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final TenantReference tenant = TenantReference.builder().id(tenantId).build();
    final ParkingLots parkingLot = ParkingLots.builder()
        .id(parkingId)
        .name("Sede Fallback")
        .tenant(tenant)
        .build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    when(dailyGateway.findByParkingLotIdAndSummaryDate(eq(parkingId), any(LocalDate.class)))
        .thenReturn(Optional.empty());

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
        .summaryDate(LocalDate.now().minusDays(2))
        .totalRevenue(new BigDecimal("50000.00"))
        .totalTickets(10L)
        .ongoingTickets(3L)
        .completedTickets(7L)
        .avgDurationMinutes(30.0)
        .currency("COP")
        .build();

    final DailySummaryModel s2 = DailySummaryModel.builder()
        .parkingLotId(parkingId)
        .tenantId(tenantId)
        .summaryDate(LocalDate.now().minusDays(1))
        .totalRevenue(new BigDecimal("70000.00"))
        .totalTickets(15L)
        .ongoingTickets(2L)
        .completedTickets(13L)
        .avgDurationMinutes(50.0)
        .currency("COP")
        .build();

    when(dailyGateway.findAllByTenantIdAndParkingLotId(tenantId, parkingId))
        .thenReturn(List.of(s1, s2));

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
  }
}
