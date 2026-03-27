package dev.angelcorzo.nivo.usecase.notifications;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;

/** Generic collaborator to dispatch parking-ticket-related notifications. */
public interface TicketNotifier {
  void notifyTicketOpened(ParkingTickets ticket);

  void notifyTicketClosed(ParkingTickets ticket);
}
