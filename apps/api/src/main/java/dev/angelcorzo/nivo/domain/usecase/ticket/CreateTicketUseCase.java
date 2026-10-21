package dev.angelcorzo.nivo.domain.usecase.ticket;

import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.UnplatedTicketSequenceGateway;
import dev.angelcorzo.nivo.domain.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.domain.usecase.notification.notifier.TicketNotifier;

public class CreateTicketUseCase extends CheckinVehicleUseCase {

    public CreateTicketUseCase(
            final ParkingTicketsRepository parkingTicketsRepository,
            final TenantsRepository tenantsRepository,
            final UsersRepository usersRepository,
            final SlotsRepository slotsRepository,
            final RatesRepository ratesRepository,
            final TicketNotifier ticketNotifier,
            final UnplatedTicketSequenceGateway unplatedTicketSequenceGateway) {
        super(
                parkingTicketsRepository,
                tenantsRepository,
                usersRepository,
                slotsRepository,
                ratesRepository,
                ticketNotifier,
                unplatedTicketSequenceGateway);
    }
}
