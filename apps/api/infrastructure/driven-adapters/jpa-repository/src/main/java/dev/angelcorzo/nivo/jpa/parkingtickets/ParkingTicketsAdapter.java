package dev.angelcorzo.nivo.jpa.parkingtickets;

import dev.angelcorzo.nivo.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.jpa.parkingtickets.mappers.ParkingTicketMapper;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class ParkingTicketsAdapter
    extends AdapterOperations<
        ParkingTickets, ParkingTicketsData, UUID, ParkingTicketsRepositoryData>
    implements ParkingTicketsRepository {

  /**
   * Constructor for AdapterOperations.
   *
   * @param repository The JPA repository instance.
   * @param mapper The mapper for converting between domain and data entities.
   */
  protected ParkingTicketsAdapter(
      ParkingTicketsRepositoryData repository, ParkingTicketMapper mapper) {
    super(repository, mapper);
  }

  @Override
  public Optional<ParkingTickets> findByTenantIdAndId(UUID tenantId, UUID id) {

    return super.repository.findByTenant_IdAndId(tenantId, id).map(super::toEntity);
  }

  @Override
  public boolean existsById(UUID id) {
    return super.repository.existsById(id);
  }

  @Override
  public ParkingTickets getReferenceById(UUID id) {
    return super.mapper.toEntity(super.repository.getReferenceById(id));
  }

  @Override
  public ParkingTickets prepareCheckout(UUID ticketId, BigDecimal amountToCharge) {
    super.repository.prepareCheckout(ticketId, amountToCharge);

    return super.findById(ticketId).orElseThrow(() -> new ParkingTicketNotFound(ticketId));
  }

  @Override
  public ParkingTickets changeStatus(UUID ticketId, ParkingTicketStatus status) {
    super.repository.changeStatus(ticketId, status);

    return super.repository.findById(ticketId).map(super::toEntity).orElse(null);
  }

  @Transactional
  @Override
  public ParkingTickets closeTicket(UUID ticketId) {
    ParkingTicketsData ticket = super.repository.findById(ticketId).orElse(null);
    if (ticket == null) {
      return null;
    }

    ticket.setStatus(ParkingTicketStatus.CLOSED);
    ticket.setClosedAt(OffsetDateTime.now());

    if (ticket.getSlot() != null) {
      ticket.getSlot().setStatus(SlotStatus.AVAILABLE);
    }

    return super.mapper.toEntity(super.repository.save(ticket));
  }

  @Override
  public List<ParkingTickets> findAllByParkingLotId(UUID parkingLotId) {
    return super.repository.findAllBySlot_Parking_Id(parkingLotId).stream()
        .map(super::toEntity)
        .toList();
  }

  @Override
  public Optional<ParkingTickets> findActiveBySlotId(UUID slotId) {
    return super.repository.findActiveBySlotId(slotId).map(super::toEntity);
  }
}
