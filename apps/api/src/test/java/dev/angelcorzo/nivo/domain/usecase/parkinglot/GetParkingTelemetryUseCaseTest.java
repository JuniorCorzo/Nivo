package dev.angelcorzo.nivo.domain.usecase.parkinglot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingTelemetry;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingTelemetryGateway;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("GetParkingTelemetryUseCase Tests")
class GetParkingTelemetryUseCaseTest {

  private ParkingTelemetryGateway telemetryGateway;
  private GetParkingTelemetryUseCase useCase;

  @BeforeEach
  void setUp() {
    telemetryGateway = mock(ParkingTelemetryGateway.class);
    useCase = new GetParkingTelemetryUseCase(telemetryGateway);
  }

  @Test
  @DisplayName("Should retrieve parking telemetry by parking ID")
  void shouldRetrieveParkingTelemetry() {
    UUID parkingId = UUID.randomUUID();
    ParkingTelemetry telemetry = ParkingTelemetry.builder()
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

    when(telemetryGateway.getTelemetry(parkingId)).thenReturn(telemetry);

    ParkingTelemetry result = useCase.execute(parkingId);

    assertThat(result).isNotNull();
    assertThat(result).isEqualTo(telemetry);
    verify(telemetryGateway).getTelemetry(parkingId);
  }
}
