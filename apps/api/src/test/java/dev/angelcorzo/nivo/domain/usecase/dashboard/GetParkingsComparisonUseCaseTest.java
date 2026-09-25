package dev.angelcorzo.nivo.domain.usecase.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.ParkingComparisonDTO;
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
class GetParkingsComparisonUseCaseTest {

  @Mock
  private DailySummaryGateway dailyGateway;

  @Mock
  private HourlyOccupancyGateway hourlyGateway;

  @Mock
  private ParkingLotsRepository parkingLotsRepository;

  @Mock
  private AuthenticationContextGateway authenticationContext;

  private GetParkingsComparisonUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase = new GetParkingsComparisonUseCase(
        dailyGateway, hourlyGateway, parkingLotsRepository, authenticationContext);
  }

  @Test
  @DisplayName("Should rank parkings by occupancy rate descending and query latest occupancy from DB")
  void shouldReturnRankedParkingsComparisonByOccupancyRateDesc() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingIdA = UUID.randomUUID();
    final UUID parkingIdB = UUID.randomUUID();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final ParkingLotListItem parkingA = ParkingLotListItem.builder()
        .id(parkingIdA)
        .name("Sede Sur")
        .currency("COP")
        .totalCapacity(100L)
        .build();

    final ParkingLotListItem parkingB = ParkingLotListItem.builder()
        .id(parkingIdB)
        .name("Sede Norte")
        .currency("COP")
        .totalCapacity(100L)
        .build();

    when(parkingLotsRepository.findByTenantId(tenantId)).thenReturn(List.of(parkingA, parkingB));

    final HourlyOccupancyModel hourlyA = HourlyOccupancyModel.builder()
        .parkingLotId(parkingIdA)
        .hourBucket(OffsetDateTime.now())
        .totalCapacity(100L)
        .estimatedOccupancyRate(30.0)
        .build();

    final HourlyOccupancyModel hourlyB = HourlyOccupancyModel.builder()
        .parkingLotId(parkingIdB)
        .hourBucket(OffsetDateTime.now())
        .totalCapacity(100L)
        .estimatedOccupancyRate(80.0)
        .build();

    when(hourlyGateway.findLatestByParkingLotId(parkingIdA)).thenReturn(Optional.of(hourlyA));
    when(hourlyGateway.findLatestByParkingLotId(parkingIdB)).thenReturn(Optional.of(hourlyB));

    final DailySummaryModel summaryB = DailySummaryModel.builder()
        .parkingLotId(parkingIdB)
        .totalRevenue(new BigDecimal("500000.00"))
        .ongoingTickets(15L)
        .avgDurationMinutes(50.0)
        .build();
    when(dailyGateway.findByParkingLotIdAndSummaryDate(eq(parkingIdA), any(LocalDate.class)))
        .thenReturn(Optional.empty());
    when(dailyGateway.findByParkingLotIdAndSummaryDate(eq(parkingIdB), any(LocalDate.class)))
        .thenReturn(Optional.of(summaryB));

    final List<ParkingComparisonDTO> result = useCase.execute(null, null);

    assertThat(result).hasSize(2);
    // Highest occupancy first
    final ParkingComparisonDTO first = result.get(0);
    final ParkingComparisonDTO second = result.get(1);

    assertThat(first.getParkingId()).isEqualTo(parkingIdB);
    assertThat(first.getParkingName()).isEqualTo("Sede Norte");
    assertThat(first.getOccupancyRate()).isEqualTo(80.0);
    assertThat(first.getOccupiedSlots()).isEqualTo(80);
    assertThat(first.getTodayRevenue()).isEqualByComparingTo(new BigDecimal("500000.00"));
    assertThat(first.getActiveTickets()).isEqualTo(15L);
    assertThat(first.getAvgStayMinutes()).isEqualTo(50.0);

    assertThat(second.getParkingId()).isEqualTo(parkingIdA);
    assertThat(second.getParkingName()).isEqualTo("Sede Sur");
    assertThat(second.getOccupancyRate()).isEqualTo(30.0);
    assertThat(second.getOccupiedSlots()).isEqualTo(30);

    verify(hourlyGateway).findLatestByParkingLotId(parkingIdA);
    verify(hourlyGateway).findLatestByParkingLotId(parkingIdB);
  }
}
