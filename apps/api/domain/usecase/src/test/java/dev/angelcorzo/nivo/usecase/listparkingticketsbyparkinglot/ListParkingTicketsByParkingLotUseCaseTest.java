package dev.angelcorzo.nivo.usecase.listparkingticketsbyparkinglot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ListParkingTicketsByParkingLotUseCase Unit Tests")
class ListParkingTicketsByParkingLotUseCaseTest {

  private ParkingTicketsRepository parkingTicketsRepository;
  private ListParkingTicketsByParkingLotUseCase useCase;

  @BeforeEach
  void setUp() {
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    useCase = new ListParkingTicketsByParkingLotUseCase(parkingTicketsRepository);
  }

  @Test
  @DisplayName("Should list all parking tickets for parking lot")
  void shouldListAllParkingTicketsForParkingLot() {
    UUID parkingId = UUID.randomUUID();
    ParkingTickets ticket1 = ParkingTickets.builder().id(UUID.randomUUID()).build();
    ParkingTickets ticket2 = ParkingTickets.builder().id(UUID.randomUUID()).build();

    when(parkingTicketsRepository.findAllByParkingLotId(parkingId)).thenReturn(List.of(ticket1, ticket2));

    List<ParkingTickets> result = useCase.execute(parkingId);

    assertThat(result).hasSize(2).containsExactly(ticket1, ticket2);
    verify(parkingTicketsRepository).findAllByParkingLotId(parkingId);
  }
}
