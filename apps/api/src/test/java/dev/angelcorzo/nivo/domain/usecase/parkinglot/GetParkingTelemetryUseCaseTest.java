package dev.angelcorzo.nivo.domain.usecase.parkinglot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingTelemetry;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingTelemetryGateway;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("GetParkingTelemetryUseCase Tests")
class GetParkingTelemetryUseCaseTest {

  private ParkingLotsRepository parkingLotsRepository;
  private AuthenticationContextGateway authenticationContext;
  private ParkingTelemetryGateway telemetryGateway;
  private GetParkingTelemetryUseCase useCase;

  @BeforeEach
  void setUp() {
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    authenticationContext = mock(AuthenticationContextGateway.class);
    telemetryGateway = mock(ParkingTelemetryGateway.class);
    useCase = new GetParkingTelemetryUseCase(parkingLotsRepository, authenticationContext, telemetryGateway);
  }

  @Test
  @DisplayName("Should retrieve parking telemetry by parking ID when tenant matches")
  void shouldRetrieveParkingTelemetry() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final ParkingLots parkingLot = ParkingLots.builder()
      .id(parkingId)
      .name("Lot A")
      .tenant(TenantReference.builder().id(tenantId).build())
      .build();

    final ParkingTelemetry telemetry = ParkingTelemetry.builder()
      .parkingId(parkingId)
      .totalCapacity(100)
      .occupiedSlots(40)
      .availableSlots(60)
      .occupancyRate(40.0)
      .carTotal(70)
      .carOccupied(30)
      .carRate(42.9)
      .motoTotal(30)
      .motoOccupied(10)
      .motoRate(33.3)
      .shiftRevenue(new BigDecimal("150000.00"))
      .averageTicketRevenue(new BigDecimal("5000.00"))
      .totalTicketsToday(35L)
      .activeTickets(5L)
      .completedTicketsToday(30L)
      .avgStayMinutes(75.5)
      .rotationIndex(0.4)
      .moraCount(2L)
      .build();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));
    when(telemetryGateway.getTelemetry(parkingId)).thenReturn(telemetry);

    final ParkingTelemetry result = useCase.execute(parkingId);

    assertThat(result).isNotNull();
    assertThat(result).isEqualTo(telemetry);
    verify(telemetryGateway).getTelemetry(parkingId);
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking does not exist")
  void shouldThrowParkingNotExistsExceptionWhenParkingDoesNotExist() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(parkingId))
      .isInstanceOf(ParkingNotExistsException.class);

    verify(telemetryGateway, never()).getTelemetry(any());
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when tenant does not match")
  void shouldThrowParkingNotExistsExceptionWhenTenantDoesNotMatch() {
    final UUID tenantId = UUID.randomUUID();
    final UUID differentTenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final ParkingLots parkingLot = ParkingLots.builder()
      .id(parkingId)
      .name("Lot Other Tenant")
      .tenant(TenantReference.builder().id(differentTenantId).build())
      .build();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    assertThatThrownBy(() -> useCase.execute(parkingId))
      .isInstanceOf(ParkingNotExistsException.class);

    verify(telemetryGateway, never()).getTelemetry(any());
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking has null tenant")
  void shouldThrowParkingNotExistsExceptionWhenTenantIsNull() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final ParkingLots parkingLot = ParkingLots.builder()
      .id(parkingId)
      .name("Lot Null Tenant")
      .tenant(null)
      .build();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    assertThatThrownBy(() -> useCase.execute(parkingId))
      .isInstanceOf(ParkingNotExistsException.class);

    verify(telemetryGateway, never()).getTelemetry(any());
  }
}
