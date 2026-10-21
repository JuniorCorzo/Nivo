package dev.angelcorzo.nivo.domain.usecase.ticket;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetPublicTicketUseCase {
  private final ParkingTicketsRepository parkingTicketsRepository;

  public ParkingTickets execute(final UUID ticketId) {
    return this.parkingTicketsRepository.findById(ticketId).orElseThrow(() -> new ParkingTicketNotFound(ticketId));
  }
}
