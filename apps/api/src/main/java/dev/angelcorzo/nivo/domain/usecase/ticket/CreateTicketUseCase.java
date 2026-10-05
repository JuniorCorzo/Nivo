package dev.angelcorzo.nivo.domain.usecase.ticket;

import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.domain.usecase.notification.notifier.TicketNotifier;

public class CreateTicketUseCase extends CheckinVehicleUseCase {

  public CreateTicketUseCase(
      ParkingTicketsRepository parkingTicketsRepository,
      TenantsRepository tenantsRepository,
      UsersRepository usersRepository,
      SlotsRepository slotsRepository,
      RatesRepository ratesRepository,
      TicketNotifier ticketNotifier) {
    super(
        parkingTicketsRepository,
        tenantsRepository,
        usersRepository,
        slotsRepository,
        ratesRepository,
        ticketNotifier);
  }
}
