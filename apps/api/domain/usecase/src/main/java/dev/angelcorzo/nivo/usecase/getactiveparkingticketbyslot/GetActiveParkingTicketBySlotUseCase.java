package dev.angelcorzo.nivo.usecase.getactiveparkingticketbyslot;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

/**
 * Use case to retrieve the active (OPEN) parking ticket associated with a specific slot.
 *
 * <p><strong>Layer:</strong> Application (Use Case)
 *
 * <p><strong>Responsibility:</strong> Query the repository for an active ticket occupying the slot.
 */
@RequiredArgsConstructor
public class GetActiveParkingTicketBySlotUseCase {
  private final ParkingTicketsRepository parkingTicketsRepository;

  /**
   * Retrieves the active parking ticket for the given slot ID.
   *
   * @param slotId The unique identifier of the slot.
   * @return An {@link Optional} containing the active {@link ParkingTickets} if present, or empty.
   */
  public Optional<ParkingTickets> execute(UUID slotId) {
    return this.parkingTicketsRepository.findActiveBySlotId(slotId);
  }
}
