package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.ParkingLotsReference;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotsReference;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets.ParkingTicketsAdapter;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@DisplayName("CachedParkingTicketsAdapter Unit Tests")
class CachedParkingTicketsAdapterTest {

  private ParkingTicketsAdapter delegate;
  private SlotsRepository slotsRepository;
  private CacheManager cacheManager;
  private CacheKeyGenerator keyGenerator;
  private Cache cache;
  private CachedParkingTicketsAdapter cachedAdapter;

  @BeforeEach
  void setUp() {
    delegate = mock(ParkingTicketsAdapter.class);
    slotsRepository = mock(SlotsRepository.class);
    cacheManager = mock(CacheManager.class);
    keyGenerator = mock(CacheKeyGenerator.class);
    cache = mock(Cache.class);
    cachedAdapter = new CachedParkingTicketsAdapter(delegate, slotsRepository, cacheManager, keyGenerator);
  }

  @Test
  @DisplayName("Should close ticket and evict slot summary cache")
  void shouldCloseTicketAndEvictSlotSummary() {
    final UUID ticketId = UUID.randomUUID();
    final UUID slotId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();

    final ParkingTickets closedTicket = ParkingTickets.builder()
      .id(ticketId)
      .slot(SlotsReference.builder().id(slotId).build())
      .build();

    final Slots slotEntity = Slots.builder()
      .id(slotId)
      .parking(ParkingLotsReference.builder().id(parkingId).build())
      .build();

    when(delegate.closeTicket(ticketId)).thenReturn(closedTicket);
    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(slotEntity));
    when(cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKey(parkingId)).thenReturn("tenant:T1:" + parkingId);

    final ParkingTickets result = cachedAdapter.closeTicket(ticketId);

    assertThat(result).isEqualTo(closedTicket);
    verify(delegate).closeTicket(ticketId);
    verify(cache).evict("tenant:T1:" + parkingId);
  }

  @Test
  @DisplayName("Should not throw when ticket has no slot on close")
  void shouldNotThrowWhenTicketHasNoSlot() {
    final UUID ticketId = UUID.randomUUID();
    final ParkingTickets closedTicket = ParkingTickets.builder().id(ticketId).build();

    when(delegate.closeTicket(ticketId)).thenReturn(closedTicket);

    final ParkingTickets result = cachedAdapter.closeTicket(ticketId);

    assertThat(result).isEqualTo(closedTicket);
    verify(delegate).closeTicket(ticketId);
    verifyNoInteractions(cacheManager);
  }

  @Test
  @DisplayName("Should delegate findById")
  void shouldDelegateFindById() {
    final UUID id = UUID.randomUUID();
    final ParkingTickets ticket = ParkingTickets.builder().id(id).build();
    when(delegate.findById(id)).thenReturn(Optional.of(ticket));

    final Optional<ParkingTickets> result = cachedAdapter.findById(id);

    assertThat(result).contains(ticket);
    verify(delegate).findById(id);
  }

  @Test
  @DisplayName("Should delegate findByTenantIdAndId")
  void shouldDelegateFindByTenantIdAndId() {
    final UUID tenantId = UUID.randomUUID();
    final UUID id = UUID.randomUUID();
    final ParkingTickets ticket = ParkingTickets.builder().id(id).build();
    when(delegate.findByTenantIdAndId(tenantId, id)).thenReturn(Optional.of(ticket));

    final Optional<ParkingTickets> result = cachedAdapter.findByTenantIdAndId(tenantId, id);

    assertThat(result).contains(ticket);
    verify(delegate).findByTenantIdAndId(tenantId, id);
  }

  @Test
  @DisplayName("Should delegate existsById")
  void shouldDelegateExistsById() {
    final UUID id = UUID.randomUUID();
    when(delegate.existsById(id)).thenReturn(true);

    final boolean result = cachedAdapter.existsById(id);

    assertThat(result).isTrue();
    verify(delegate).existsById(id);
  }

  @Test
  @DisplayName("Should delegate getReferenceById")
  void shouldDelegateGetReferenceById() {
    final UUID id = UUID.randomUUID();
    final ParkingTickets ticket = ParkingTickets.builder().id(id).build();
    when(delegate.getReferenceById(id)).thenReturn(ticket);

    final ParkingTickets result = cachedAdapter.getReferenceById(id);

    assertThat(result).isEqualTo(ticket);
    verify(delegate).getReferenceById(id);
  }

  @Test
  @DisplayName("Should delegate save")
  void shouldDelegateSave() {
    final ParkingTickets ticket = ParkingTickets.builder().id(UUID.randomUUID()).build();
    when(delegate.save(ticket)).thenReturn(ticket);

    final ParkingTickets result = cachedAdapter.save(ticket);

    assertThat(result).isEqualTo(ticket);
    verify(delegate).save(ticket);
  }

  @Test
  @DisplayName("Should delegate prepareCheckout")
  void shouldDelegatePrepareCheckout() {
    final UUID ticketId = UUID.randomUUID();
    final BigDecimal amount = new BigDecimal("10000.00");
    final ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
    when(delegate.prepareCheckout(ticketId, amount)).thenReturn(ticket);

    final ParkingTickets result = cachedAdapter.prepareCheckout(ticketId, amount);

    assertThat(result).isEqualTo(ticket);
    verify(delegate).prepareCheckout(ticketId, amount);
  }

  @Test
  @DisplayName("Should delegate changeStatus")
  void shouldDelegateChangeStatus() {
    final UUID ticketId = UUID.randomUUID();
    final ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
    when(delegate.changeStatus(ticketId, ParkingTicketStatus.LOST)).thenReturn(ticket);

    final ParkingTickets result = cachedAdapter.changeStatus(ticketId, ParkingTicketStatus.LOST);

    assertThat(result).isEqualTo(ticket);
    verify(delegate).changeStatus(ticketId, ParkingTicketStatus.LOST);
  }

  @Test
  @DisplayName("Should delegate findAllByParkingLotId")
  void shouldDelegateFindAllByParkingLotId() {
    final UUID parkingLotId = UUID.randomUUID();
    final ParkingTickets ticket = ParkingTickets.builder().id(UUID.randomUUID()).build();
    when(delegate.findAllByParkingLotId(parkingLotId)).thenReturn(List.of(ticket));

    final List<ParkingTickets> result = cachedAdapter.findAllByParkingLotId(parkingLotId);

    assertThat(result).containsExactly(ticket);
    verify(delegate).findAllByParkingLotId(parkingLotId);
  }

  @Test
  @DisplayName("Should delegate findActiveBySlotId")
  void shouldDelegateFindActiveBySlotId() {
    final UUID slotId = UUID.randomUUID();
    final ParkingTickets ticket = ParkingTickets.builder().id(UUID.randomUUID()).build();
    when(delegate.findActiveBySlotId(slotId)).thenReturn(Optional.of(ticket));

    final Optional<ParkingTickets> result = cachedAdapter.findActiveBySlotId(slotId);

    assertThat(result).contains(ticket);
    verify(delegate).findActiveBySlotId(slotId);
  }
}
