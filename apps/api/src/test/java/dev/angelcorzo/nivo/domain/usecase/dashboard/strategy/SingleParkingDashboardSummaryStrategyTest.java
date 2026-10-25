package dev.angelcorzo.nivo.domain.usecase.dashboard.strategy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.domain.usecase.dashboard.DashboardSummaryQuery;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SingleParkingDashboardSummaryStrategyTest {

  @Mock
  private DailySummaryGateway dailyGateway;

  @Mock
  private HourlyOccupancyGateway hourlyGateway;

  @Mock
  private ParkingLotsRepository parkingLotsRepository;

  private SingleParkingDashboardSummaryStrategy strategy;

  @BeforeEach
  void setUp() {
    strategy = new SingleParkingDashboardSummaryStrategy(dailyGateway, hourlyGateway, parkingLotsRepository);
  }

  @Test
  @DisplayName("Should support query when parkingId is present")
  void shouldSupportWhenParkingIdPresent() {
    final DashboardSummaryQuery query = DashboardSummaryQuery.builder()
      .tenantId(UUID.randomUUID())
      .parkingId(UUID.randomUUID())
      .build();

    assertThat(strategy.supports(query)).isTrue();
  }

  @Test
  @DisplayName("Should not support query when parkingId is null")
  void shouldNotSupportWhenParkingIdNull() {
    final DashboardSummaryQuery query = DashboardSummaryQuery.builder()
      .tenantId(UUID.randomUUID())
      .parkingId(null)
      .build();

    assertThat(strategy.supports(query)).isFalse();
    assertThat(strategy.supports(null)).isFalse();
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking lot not found")
  void shouldThrowWhenParkingLotNotFound() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final DashboardSummaryQuery query = DashboardSummaryQuery.builder()
      .tenantId(tenantId)
      .parkingId(parkingId)
      .build();

    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> strategy.execute(query))
      .isInstanceOf(ParkingNotExistsException.class);
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when tenant mismatch occurs")
  void shouldThrowWhenTenantMismatch() {
    final UUID tenantId = UUID.randomUUID();
    final UUID differentTenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final DashboardSummaryQuery query = DashboardSummaryQuery.builder()
      .tenantId(tenantId)
      .parkingId(parkingId)
      .build();

    final TenantReference otherTenant = TenantReference.builder().id(differentTenantId).build();
    final ParkingLots parkingLot = ParkingLots.builder().id(parkingId).name("Mismatch").tenant(otherTenant).build();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    assertThatThrownBy(() -> strategy.execute(query))
      .isInstanceOf(ParkingNotExistsException.class);
  }
}
