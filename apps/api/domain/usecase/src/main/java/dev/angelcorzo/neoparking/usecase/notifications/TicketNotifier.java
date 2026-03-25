package dev.angelcorzo.neoparking.usecase.notifications;

import dev.angelcorzo.neoparking.model.parkingtickets.ParkingTickets;

/** Generic collaborator to dispatch parking-ticket-related notifications. */
public interface TicketNotifier {
  void notifyTicketOpened(ParkingTickets ticket);

  void notifyTicketClosed(ParkingTickets ticket);
}
