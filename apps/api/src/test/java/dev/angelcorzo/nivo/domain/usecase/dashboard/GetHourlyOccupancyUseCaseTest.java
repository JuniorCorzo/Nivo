package dev.angelcorzo.nivo.domain.usecase.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.HourlyOccupancyDTO;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GetHourlyOccupancyUseCaseTest {

  @Mock
  private HourlyOccupancyGateway hourlyGateway;

  @Mock
  private AuthenticationContextGateway authenticationContext;

  private GetHourlyOccupancyUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase = new GetHourlyOccupancyUseCase(hourlyGateway, authenticationContext);
  }

  @Test
  @DisplayName("Should return parking hourly occupancy with early return when parkingId is provided")
  void shouldReturnParkingHourlyOccupancyWhenParkingIdProvided() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final OffsetDateTime start = OffsetDateTime.parse("2026-09-25T08:00:00Z");
    final OffsetDateTime end = OffsetDateTime.parse("2026-09-25T12:00:00Z");
    final OffsetDateTime hourBucket = OffsetDateTime.parse("2026-09-25T09:00:00Z");

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final HourlyOccupancyModel model = HourlyOccupancyModel.builder()
        .parkingLotId(parkingId)
        .tenantId(tenantId)
        .hourBucket(hourBucket)
        .checkins(15L)
        .checkouts(5L)
        .totalCapacity(50L)
        .estimatedOccupancyRate(30.0)
        .build();

    when(hourlyGateway.findByTenantIdAndParkingLotIdAndHourBucketBetween(tenantId, parkingId, start, end))
        .thenReturn(List.of(model));

    final List<HourlyOccupancyDTO> result = useCase.execute(parkingId, start, end);

    assertThat(result).hasSize(1);
    final HourlyOccupancyDTO dto = result.getFirst();
    assertThat(dto.getParkingId()).isEqualTo(parkingId);
    assertThat(dto.getHourBucket()).isEqualTo(hourBucket);
    assertThat(dto.getCheckins()).isEqualTo(15L);
    assertThat(dto.getCheckouts()).isEqualTo(5L);
    assertThat(dto.getTotalCapacity()).isEqualTo(50L);
    assertThat(dto.getOccupancyRate()).isEqualTo(30.0);
  }

  @Test
  @DisplayName("Should return aggregated tenant hourly occupancy when parkingId is null")
  void shouldReturnAggregatedTenantHourlyOccupancyWhenParkingIdNull() {
    final UUID tenantId = UUID.randomUUID();
    final OffsetDateTime hourBucket = OffsetDateTime.parse("2026-09-25T10:00:00Z");

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    final HourlyOccupancyModel branch1 = HourlyOccupancyModel.builder()
        .parkingLotId(UUID.randomUUID())
        .tenantId(tenantId)
        .hourBucket(hourBucket)
        .checkins(20L)
        .checkouts(8L)
        .totalCapacity(100L)
        .estimatedOccupancyRate(20.0)
        .build();

    final HourlyOccupancyModel branch2 = HourlyOccupancyModel.builder()
        .parkingLotId(UUID.randomUUID())
        .tenantId(tenantId)
        .hourBucket(hourBucket)
        .checkins(10L)
        .checkouts(2L)
        .totalCapacity(100L)
        .estimatedOccupancyRate(10.0)
        .build();

    when(hourlyGateway.findByTenantId(tenantId)).thenReturn(List.of(branch1, branch2));

    final List<HourlyOccupancyDTO> result = useCase.execute(null, null, null);

    assertThat(result).hasSize(1);
    final HourlyOccupancyDTO aggregated = result.getFirst();
    assertThat(aggregated.getParkingId()).isNull();
    assertThat(aggregated.getHourBucket()).isEqualTo(hourBucket);
    assertThat(aggregated.getCheckins()).isEqualTo(30L);
    assertThat(aggregated.getCheckouts()).isEqualTo(10L);
    assertThat(aggregated.getTotalCapacity()).isEqualTo(200L);
    assertThat(aggregated.getOccupancyRate()).isEqualTo(15.0);
  }
}
