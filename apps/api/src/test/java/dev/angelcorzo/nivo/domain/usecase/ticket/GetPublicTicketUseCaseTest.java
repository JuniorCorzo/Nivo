package dev.angelcorzo.nivo.domain.usecase.ticket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.PlateCountry;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.parkingtickets.valueobjects.SlotSnapshot;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("GetPublicTicketUseCase Tests")
class GetPublicTicketUseCaseTest {

  private ParkingTicketsRepository parkingTicketsRepository;
  private GetPublicTicketUseCase useCase;

  @BeforeEach
  void setUp() {
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    useCase = new GetPublicTicketUseCase(parkingTicketsRepository);
  }

  @Nested
  @DisplayName("Happy Path")
  class HappyPath {

    @Test
    @DisplayName("Should return public ticket when found by UUID including unplated motorcycle fields, snapshot and rate")
    void shouldReturnPublicTicketWhenFound() {
      // Arrange
      final UUID ticketId = UUID.randomUUID();
      final UUID slotId = UUID.randomUUID();
      final UUID rateId = UUID.randomUUID();
      final String syntheticPlate = "SP-1042";
      final String photoUrl = "https://storage.nivo.dev/photos/bike-sp1042.jpg";
      final OffsetDateTime entryTime = OffsetDateTime.now();

      final SlotSnapshot slotSnapshot = SlotSnapshot.builder()
        .id(slotId)
        .slotNumber("M-05")
        .zone("ZONE-M")
        .prefix("M")
        .type(SlotType.MOTORCYCLE)
        .hasCharger(false)
        .isAccessible(true)
        .build();

      final RateReference rate = RateReference.builder()
        .id(rateId)
        .name("Tarifa Moto Frontera")
        .description("Tarifa horaria para motocicletas")
        .pricePerUnit(new BigDecimal("2000.00"))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(15)
        .vehicleType(VehicleType.MOTORCYCLE)
        .build();

      final ParkingTickets ticket = ParkingTickets.builder()
        .id(ticketId)
        .licensePlate(syntheticPlate)
        .plateCountry(PlateCountry.UNPLATED)
        .photoUrl(photoUrl)
        .phoneNumber("+573001234567")
        .entryTime(entryTime)
        .status(ParkingTicketStatus.OPEN)
        .slotSnapshot(slotSnapshot)
        .rate(rate)
        .totalToCharge(new BigDecimal("2000.00"))
        .build();

      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));

      // Act
      final ParkingTickets result = useCase.execute(ticketId);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(ticketId);
      assertThat(result.getLicensePlate()).isEqualTo("SP-1042");
      assertThat(result.getPlateCountry()).isEqualTo(PlateCountry.UNPLATED);
      assertThat(result.getPhotoUrl()).isEqualTo(photoUrl);
      assertThat(result.getPhoneNumber()).isEqualTo("+573001234567");
      assertThat(result.getStatus()).isEqualTo(ParkingTicketStatus.OPEN);
      assertThat(result.getEntryTime()).isEqualTo(entryTime);
      assertThat(result.getSlotSnapshot()).isNotNull();
      assertThat(result.getSlotSnapshot().id()).isEqualTo(slotId);
      assertThat(result.getSlotSnapshot().slotNumber()).isEqualTo("M-05");
      assertThat(result.getSlotSnapshot().type()).isEqualTo(SlotType.MOTORCYCLE);
      assertThat(result.getRate()).isNotNull();
      assertThat(result.getRate().id()).isEqualTo(rateId);
      assertThat(result.getRate().name()).isEqualTo("Tarifa Moto Frontera");
      assertThat(result.getRate().pricePerUnit()).isEqualByComparingTo("2000.00");
      verify(parkingTicketsRepository).findById(ticketId);
    }
  }

  @Nested
  @DisplayName("Failure Scenarios")
  class FailureScenarios {

    @Test
    @DisplayName("Should throw ParkingTicketNotFound when ticket does not exist")
    void shouldThrowParkingTicketNotFoundWhenTicketDoesNotExist() {
      // Arrange
      final UUID ticketId = UUID.randomUUID();
      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> useCase.execute(ticketId)).isInstanceOf(ParkingTicketNotFound.class);
      verify(parkingTicketsRepository).findById(ticketId);
    }
  }
}
