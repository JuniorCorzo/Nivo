package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingTelemetry;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ParkingTelemetryAdapter Unit Tests")
class ParkingTelemetryAdapterTest {

  private ParkingLotsRepositoryData repositoryData;
  private ParkingTelemetryAdapter adapter;

  @BeforeEach
  void setUp() {
    repositoryData = mock(ParkingLotsRepositoryData.class);
    adapter = new ParkingTelemetryAdapter(repositoryData);
  }

  @Test
  @DisplayName("Should correctly map and compute telemetry rates when data is present")
  void shouldComputeTelemetryRatesCorrectly() {
    final UUID parkingId = UUID.randomUUID();
    final ParkingTelemetryProjection projection = mock(ParkingTelemetryProjection.class);

    when(projection.getTotalCapacity()).thenReturn(100);
    when(projection.getOccupiedSlots()).thenReturn(40);
    when(projection.getCarTotal()).thenReturn(70);
    when(projection.getCarOccupied()).thenReturn(30);
    when(projection.getMotoTotal()).thenReturn(30);
    when(projection.getMotoOccupied()).thenReturn(10);
    when(projection.getMoraCount()).thenReturn(2L);
    when(projection.getShiftRevenue()).thenReturn(new BigDecimal("150000.00"));
    when(projection.getCompletedTicketsToday()).thenReturn(30L);
    when(projection.getTotalTicketsToday()).thenReturn(35L);
    when(projection.getAvgStayMinutes()).thenReturn(75.5);

    final OccupiedSlotProjection slotProjection = mock(OccupiedSlotProjection.class);
    when(slotProjection.getSlotNumber()).thenReturn("A-01");
    when(slotProjection.getZone()).thenReturn("Nivel 1");
    when(slotProjection.getPrefix()).thenReturn("A");
    when(slotProjection.getType()).thenReturn("CAR");
    when(slotProjection.getLicensePlate()).thenReturn("KLM 482");

    when(repositoryData.findTelemetryByParkingLotId(parkingId)).thenReturn(projection);
    when(repositoryData.findOccupiedSlotsDetailByParkingLotId(parkingId)).thenReturn(List.of(slotProjection));

    final ParkingTelemetry telemetry = adapter.getTelemetry(parkingId);

    assertThat(telemetry.parkingId()).isEqualTo(parkingId);
    assertThat(telemetry.totalCapacity()).isEqualTo(100);
    assertThat(telemetry.occupiedSlots()).isEqualTo(40);
    assertThat(telemetry.availableSlots()).isEqualTo(60);
    assertThat(telemetry.occupancyRate()).isEqualTo(40.0);
    assertThat(telemetry.carTotal()).isEqualTo(70);
    assertThat(telemetry.carOccupied()).isEqualTo(30);
    assertThat(telemetry.carRate()).isEqualTo(42.9);
    assertThat(telemetry.motoTotal()).isEqualTo(30);
    assertThat(telemetry.motoOccupied()).isEqualTo(10);
    assertThat(telemetry.motoRate()).isEqualTo(33.3);
    assertThat(telemetry.moraCount()).isEqualTo(2L);
    assertThat(telemetry.shiftRevenue()).isEqualByComparingTo("150000.00");
    assertThat(telemetry.completedTicketsToday()).isEqualTo(30L);
    assertThat(telemetry.totalTicketsToday()).isEqualTo(35L);
    assertThat(telemetry.activeTickets()).isEqualTo(5L);
    assertThat(telemetry.averageTicketRevenue()).isEqualByComparingTo("5000.00");
    assertThat(telemetry.avgStayMinutes()).isEqualTo(75.5);
    assertThat(telemetry.rotationIndex()).isEqualTo(0.4);
    assertThat(telemetry.shiftTargetPercentage()).isEqualTo(30.0);
    assertThat(telemetry.occupiedSlotsDetail()).hasSize(1);
    assertThat(telemetry.occupiedSlotsDetail().getFirst().slotNumber()).isEqualTo("A-01");
    assertThat(telemetry.occupiedSlotsDetail().getFirst().zone()).isEqualTo("Nivel 1");
    assertThat(telemetry.occupiedSlotsDetail().getFirst().prefix()).isEqualTo("A");
    assertThat(telemetry.occupiedSlotsDetail().getFirst().type()).isEqualTo("CAR");
    assertThat(telemetry.occupiedSlotsDetail().getFirst().licensePlate()).isEqualTo("KLM 482");
  }

  @Test
  @DisplayName("Should handle zero-capacity, zero-tickets and edge cases without division by zero")
  void shouldHandleZeroCapacityGracefully() {
    final UUID parkingId = UUID.randomUUID();
    final ParkingTelemetryProjection projection = mock(ParkingTelemetryProjection.class);

    when(projection.getTotalCapacity()).thenReturn(0);
    when(projection.getOccupiedSlots()).thenReturn(0);
    when(projection.getCarTotal()).thenReturn(0);
    when(projection.getCarOccupied()).thenReturn(0);
    when(projection.getMotoTotal()).thenReturn(0);
    when(projection.getMotoOccupied()).thenReturn(0);
    when(projection.getMoraCount()).thenReturn(0L);
    when(projection.getShiftRevenue()).thenReturn(BigDecimal.ZERO);
    when(projection.getCompletedTicketsToday()).thenReturn(0L);
    when(projection.getTotalTicketsToday()).thenReturn(0L);
    when(projection.getAvgStayMinutes()).thenReturn(0.0);

    when(repositoryData.findTelemetryByParkingLotId(parkingId)).thenReturn(projection);
    when(repositoryData.findOccupiedSlotsDetailByParkingLotId(parkingId)).thenReturn(List.of());

    final ParkingTelemetry telemetry = adapter.getTelemetry(parkingId);

    assertThat(telemetry.parkingId()).isEqualTo(parkingId);
    assertThat(telemetry.totalCapacity()).isZero();
    assertThat(telemetry.occupiedSlots()).isZero();
    assertThat(telemetry.availableSlots()).isZero();
    assertThat(telemetry.occupancyRate()).isEqualTo(0.0);
    assertThat(telemetry.carTotal()).isZero();
    assertThat(telemetry.carOccupied()).isZero();
    assertThat(telemetry.carRate()).isEqualTo(0.0);
    assertThat(telemetry.motoTotal()).isZero();
    assertThat(telemetry.motoOccupied()).isZero();
    assertThat(telemetry.motoRate()).isEqualTo(0.0);
    assertThat(telemetry.moraCount()).isZero();
    assertThat(telemetry.shiftRevenue()).isEqualTo(BigDecimal.ZERO);
    assertThat(telemetry.completedTicketsToday()).isZero();
    assertThat(telemetry.totalTicketsToday()).isZero();
    assertThat(telemetry.activeTickets()).isZero();
    assertThat(telemetry.averageTicketRevenue()).isEqualTo(BigDecimal.ZERO);
    assertThat(telemetry.avgStayMinutes()).isEqualTo(0.0);
    assertThat(telemetry.rotationIndex()).isEqualTo(0.0);
    assertThat(telemetry.shiftTargetPercentage()).isEqualTo(0.0);
    assertThat(telemetry.occupiedSlotsDetail()).isEmpty();
  }

  @Test
  @DisplayName("Should handle null projection safely with default zero values")
  void shouldHandleNullProjectionSafely() {
    final UUID parkingId = UUID.randomUUID();
    when(repositoryData.findTelemetryByParkingLotId(parkingId)).thenReturn(null);
    when(repositoryData.findOccupiedSlotsDetailByParkingLotId(parkingId)).thenReturn(null);

    final ParkingTelemetry telemetry = adapter.getTelemetry(parkingId);

    assertThat(telemetry.parkingId()).isEqualTo(parkingId);
    assertThat(telemetry.totalCapacity()).isZero();
    assertThat(telemetry.occupiedSlots()).isZero();
    assertThat(telemetry.availableSlots()).isZero();
    assertThat(telemetry.occupancyRate()).isEqualTo(0.0);
    assertThat(telemetry.carTotal()).isZero();
    assertThat(telemetry.carOccupied()).isZero();
    assertThat(telemetry.carRate()).isEqualTo(0.0);
    assertThat(telemetry.motoTotal()).isZero();
    assertThat(telemetry.motoOccupied()).isZero();
    assertThat(telemetry.motoRate()).isEqualTo(0.0);
    assertThat(telemetry.moraCount()).isZero();
    assertThat(telemetry.shiftRevenue()).isEqualTo(BigDecimal.ZERO);
    assertThat(telemetry.completedTicketsToday()).isZero();
    assertThat(telemetry.totalTicketsToday()).isZero();
    assertThat(telemetry.activeTickets()).isZero();
    assertThat(telemetry.averageTicketRevenue()).isEqualTo(BigDecimal.ZERO);
    assertThat(telemetry.avgStayMinutes()).isEqualTo(0.0);
    assertThat(telemetry.rotationIndex()).isEqualTo(0.0);
    assertThat(telemetry.shiftTargetPercentage()).isEqualTo(0.0);
    assertThat(telemetry.occupiedSlotsDetail()).isEmpty();
  }

  @Test
  @DisplayName("Should calculate shift target percentage accurately when target is exceeded")
  void shouldCalculateShiftTargetPercentageAccurately() {
    final UUID parkingId = UUID.randomUUID();
    final ParkingTelemetryProjection projection = mock(ParkingTelemetryProjection.class);

    when(projection.getTotalCapacity()).thenReturn(100);
    when(projection.getShiftRevenue()).thenReturn(new BigDecimal("520000.00"));
    when(repositoryData.findTelemetryByParkingLotId(parkingId)).thenReturn(projection);

    final ParkingTelemetry telemetry = adapter.getTelemetry(parkingId);

    assertThat(telemetry.shiftTargetPercentage()).isEqualTo(104.0);
  }
}
