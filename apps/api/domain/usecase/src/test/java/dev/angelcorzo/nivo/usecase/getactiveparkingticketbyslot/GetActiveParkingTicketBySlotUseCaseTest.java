package dev.angelcorzo.nivo.usecase.getactiveparkingticketbyslot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("GetActiveParkingTicketBySlotUseCase Unit Tests")
class GetActiveParkingTicketBySlotUseCaseTest {

  private ParkingTicketsRepository parkingTicketsRepository;
  private GetActiveParkingTicketBySlotUseCase useCase;

  @BeforeEach
  void setUp() {
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    useCase = new GetActiveParkingTicketBySlotUseCase(parkingTicketsRepository);
  }

  @Test
  @DisplayName("Should return active ticket when slot has an open ticket")
  void shouldReturnActiveTicketWhenPresent() {
    UUID slotId = UUID.randomUUID();
    ParkingTickets ticket =
        ParkingTickets.builder().id(UUID.randomUUID()).status(ParkingTicketStatus.OPEN).build();

    when(parkingTicketsRepository.findActiveBySlotId(slotId)).thenReturn(Optional.of(ticket));

    Optional<ParkingTickets> result = useCase.execute(slotId);

    assertThat(result).isPresent().contains(ticket);
    verify(parkingTicketsRepository).findActiveBySlotId(slotId);
  }

  @Test
  @DisplayName("Should return empty when slot has no active ticket")
  void shouldReturnEmptyWhenNoActiveTicket() {
    UUID slotId = UUID.randomUUID();

    when(parkingTicketsRepository.findActiveBySlotId(slotId)).thenReturn(Optional.empty());

    Optional<ParkingTickets> result = useCase.execute(slotId);

    assertThat(result).isEmpty();
    verify(parkingTicketsRepository).findActiveBySlotId(slotId);
  }
}
