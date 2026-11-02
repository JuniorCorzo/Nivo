package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.TenantAwareKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets.mappers.ParkingTicketMapper;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class ParkingTicketsAdapter
  extends
    AdapterOperations<ParkingTickets, ParkingTicketsData, UUID, ParkingTicketsRepositoryData>
  implements
    ParkingTicketsRepository {

  private final CacheManager cacheManager;
  private final TenantAwareKeyGenerator keyGenerator;

  @org.springframework.beans.factory.annotation.Autowired
  public ParkingTicketsAdapter(ParkingTicketsRepositoryData repository, ParkingTicketMapper mapper,
    ObjectProvider<CacheManager> cacheManagerProvider, ObjectProvider<TenantAwareKeyGenerator> keyGeneratorProvider) {
    super(repository, mapper);
    this.cacheManager = cacheManagerProvider != null ? cacheManagerProvider.getIfAvailable() : null;
    this.keyGenerator = keyGeneratorProvider != null ? keyGeneratorProvider.getIfAvailable() : null;
  }

  public ParkingTicketsAdapter(ParkingTicketsRepositoryData repository, ParkingTicketMapper mapper,
    CacheManager cacheManager, TenantAwareKeyGenerator keyGenerator) {
    super(repository, mapper);
    this.cacheManager = cacheManager;
    this.keyGenerator = keyGenerator;
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
      if (ticket.getSlot().getParking() != null && ticket.getSlot().getParking().getId() != null
        && this.cacheManager != null && this.keyGenerator != null) {
        final UUID parkingLotId = ticket.getSlot().getParking().getId();
        final Cache cache = this.cacheManager.getCache(CacheNames.SLOT_SUMMARY);
        if (cache != null) {
          cache.evict(this.keyGenerator.buildKey(parkingLotId));
        }
      }
    }

    return super.mapper.toEntity(super.repository.save(ticket));
  }

  @Override
  public List<ParkingTickets> findAllByParkingLotId(UUID parkingLotId) {
    return super.repository.findAllBySlot_Parking_Id(parkingLotId).stream().map(super::toEntity).toList();
  }

  @Override
  public Optional<ParkingTickets> findActiveBySlotId(UUID slotId) {
    return super.repository.findActiveBySlotId(slotId).map(super::toEntity);
  }
}
