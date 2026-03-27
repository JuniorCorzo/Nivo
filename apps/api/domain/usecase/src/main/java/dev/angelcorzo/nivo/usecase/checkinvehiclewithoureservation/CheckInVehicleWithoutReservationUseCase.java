package dev.angelcorzo.nivo.usecase.checkinvehiclewithoureservation;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.rates.exceptions.RateNotFoundException;
import dev.angelcorzo.nivo.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.model.slots.valueobject.SlotsReference;
import dev.angelcorzo.nivo.model.tenants.exceptions.TenantNotExistsException;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import dev.angelcorzo.nivo.usecase.notifications.TicketNotifier;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CheckInVehicleWithoutReservationUseCase {
  private final ParkingTicketsRepository parkingTicketsRepository;
  private final TenantsRepository tenantsRepository;
  private final UsersRepository usersRepository;
  private final SlotsRepository slotsRepository;
  private final RatesRepository ratesRepository;
  private final TicketNotifier ticketNotifier;

  public ParkingTickets execute(CreatedParkingTicket command) {
    this.validate(command);

    final Users user = this.getUser(command.email());

    final ParkingTickets parkingTicket =
        ParkingTickets.builder()
            .slot(SlotsReference.of(this.slotsRepository.getReferenceById(command.slotId())))
            .tenant(TenantReference.of(this.tenantsRepository.getReferenceById(command.tenantId())))
            .user(UserReference.of(user))
            .rate(RateReference.of(this.ratesRepository.getReferenceById(command.rateId())))
            .entryTime(OffsetDateTime.now())
            .licensePlate(command.plate())
            .build();

    final ParkingTickets ticket = this.parkingTicketsRepository.save(parkingTicket);

    if (user != null) this.ticketNotifier.notifyTicketOpened(ticket);

    return ticket;
  }

  private void validate(CreatedParkingTicket ticket) {
    if (!this.slotsRepository.existsById(ticket.slotId()))
      throw new SlotNotFoundException(ticket.slotId());

    if (!this.tenantsRepository.existsById(ticket.tenantId()))
      throw new TenantNotExistsException(ticket.tenantId());
    if (!ratesRepository.existsById(ticket.rateId()))
      throw new RateNotFoundException(ticket.rateId());
  }

  private Users getUser(String email) {
    if (email == null) return null;

    return this.usersRepository.findByEmail(email).orElse(null);
  }

  @Builder(toBuilder = true)
  public record CreatedParkingTicket(
      UUID slotId, UUID tenantId, String email, UUID rateId, String plate) {}
}
