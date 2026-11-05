package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.ParkingLotsReference;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotsReference;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets.ParkingTicketsAdapter;
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
}
