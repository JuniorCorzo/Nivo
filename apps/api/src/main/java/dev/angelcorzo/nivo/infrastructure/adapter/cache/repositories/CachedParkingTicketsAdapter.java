package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets.ParkingTicketsAdapter;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

/**
 * Caching decorator for {@link ParkingTicketsRepository}.
 */
@Primary
@Repository("cachedParkingTicketsAdapter")
@RequiredArgsConstructor
public class CachedParkingTicketsAdapter implements ParkingTicketsRepository {

  private final ParkingTicketsAdapter delegate;
  private final SlotsRepository slotsRepository;
  private final CacheManager cacheManager;
  private final CacheKeyGenerator keyGenerator;

  @Override
  public ParkingTickets closeTicket(final UUID ticketId) {
    final ParkingTickets closedTicket = this.delegate.closeTicket(ticketId);
    if (closedTicket != null && closedTicket.getSlot() != null && closedTicket.getSlot().id() != null) {
      evictSlotSummaryBySlotId(closedTicket.getSlot().id());
    }
    return closedTicket;
  }

  @Override
  public Optional<ParkingTickets> findById(final UUID id) {
    return this.delegate.findById(id);
  }

  @Override
  public Optional<ParkingTickets> findByTenantIdAndId(final UUID tenantId, final UUID id) {
    return this.delegate.findByTenantIdAndId(tenantId, id);
  }

  @Override
  public boolean existsById(final UUID id) {
    return this.delegate.existsById(id);
  }

  @Override
  public ParkingTickets getReferenceById(final UUID id) {
    return this.delegate.getReferenceById(id);
  }

  @Override
  public ParkingTickets save(final ParkingTickets entity) {
    return this.delegate.save(entity);
  }

  @Override
  public ParkingTickets prepareCheckout(final UUID ticketId, final BigDecimal amountToCharge) {
    return this.delegate.prepareCheckout(ticketId, amountToCharge);
  }

  @Override
  public ParkingTickets changeStatus(final UUID ticketId, final ParkingTicketStatus status) {
    return this.delegate.changeStatus(ticketId, status);
  }

  @Override
  public List<ParkingTickets> findAllByParkingLotId(final UUID parkingLotId) {
    return this.delegate.findAllByParkingLotId(parkingLotId);
  }

  @Override
  public Optional<ParkingTickets> findActiveBySlotId(final UUID slotId) {
    return this.delegate.findActiveBySlotId(slotId);
  }

  private void evictSlotSummaryBySlotId(final UUID slotId) {
    if (slotId == null || this.cacheManager == null || this.keyGenerator == null || this.slotsRepository == null) {
      return;
    }
    final Optional<Slots> slotOpt = this.slotsRepository.findById(slotId);
    if (slotOpt.isEmpty() || slotOpt.get().getParking() == null) {
      return;
    }
    final UUID parkingId = slotOpt.get().getParking().id();
    if (parkingId == null) {
      return;
    }
    final Cache cache = this.cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName());
    if (cache == null) {
      return;
    }
    cache.evict(this.keyGenerator.buildKey(parkingId));
  }
}
