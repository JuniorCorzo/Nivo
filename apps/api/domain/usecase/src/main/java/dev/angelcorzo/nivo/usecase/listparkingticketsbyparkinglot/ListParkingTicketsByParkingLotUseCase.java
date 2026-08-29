package dev.angelcorzo.nivo.usecase.listparkingticketsbyparkinglot;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

/**
 * Use case to list all parking tickets for a given parking lot.
 *
 * <p><strong>Layer:</strong> Application (Use Case)
 *
 * <p><strong>Responsibility:</strong> Retrieve all parking tickets associated with the specified
 * parking lot.
 */
@RequiredArgsConstructor
public class ListParkingTicketsByParkingLotUseCase {
  private final ParkingTicketsRepository parkingTicketsRepository;

  /**
   * Retrieves all parking tickets belonging to the given parking lot ID.
   *
   * @param parkingLotId The unique identifier of the parking lot.
   * @return A list of {@link ParkingTickets}.
   */
  public List<ParkingTickets> execute(UUID parkingLotId) {
    return this.parkingTicketsRepository.findAllByParkingLotId(parkingLotId);
  }
}
