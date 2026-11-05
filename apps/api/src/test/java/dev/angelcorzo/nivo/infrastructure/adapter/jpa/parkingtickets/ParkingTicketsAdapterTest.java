package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets.mappers.ParkingTicketMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.SlotsData;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ParkingTicketsAdapter Pure JPA Unit Tests")
class ParkingTicketsAdapterTest {

  private ParkingTicketsRepositoryData repository;
  private ParkingTicketMapper mapper;
  private ParkingTicketsAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(ParkingTicketsRepositoryData.class);
    mapper = mock(ParkingTicketMapper.class);
    adapter = new ParkingTicketsAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find parking ticket by tenant ID and ID")
  void shouldFindByTenantIdAndId() {
    final UUID tenantId = UUID.randomUUID();
    final UUID id = UUID.randomUUID();
    final ParkingTicketsData data = new ParkingTicketsData();
    final ParkingTickets entity = ParkingTickets.builder().id(id).build();

    when(repository.findByTenant_IdAndId(tenantId, id)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final Optional<ParkingTickets> result = adapter.findByTenantIdAndId(tenantId, id);

    assertThat(result).isPresent().contains(entity);
    verify(repository).findByTenant_IdAndId(tenantId, id);
    verify(mapper).toEntity(data);
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should return empty when ticket not found by tenant ID and ID")
  void shouldReturnEmptyWhenTicketNotFoundByTenantIdAndId() {
    final UUID tenantId = UUID.randomUUID();
    final UUID id = UUID.randomUUID();

    when(repository.findByTenant_IdAndId(tenantId, id)).thenReturn(Optional.empty());

    final Optional<ParkingTickets> result = adapter.findByTenantIdAndId(tenantId, id);

    assertThat(result).isEmpty();
    verify(repository).findByTenant_IdAndId(tenantId, id);
    verify(mapper, never()).toEntity(any());
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should check ticket existence by ID")
  void shouldCheckExistsById() {
    final UUID id = UUID.randomUUID();

    when(repository.existsById(id)).thenReturn(true);

    final boolean result = adapter.existsById(id);

    assertThat(result).isTrue();
    verify(repository).existsById(id);
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should get reference by ID")
  void shouldGetReferenceById() {
    final UUID id = UUID.randomUUID();
    final ParkingTicketsData data = new ParkingTicketsData();
    final ParkingTickets entity = ParkingTickets.builder().id(id).build();

    when(repository.getReferenceById(id)).thenReturn(data);
    when(mapper.toEntity(data)).thenReturn(entity);

    final ParkingTickets result = adapter.getReferenceById(id);

    assertThat(result).isEqualTo(entity);
    verify(repository).getReferenceById(id);
    verify(mapper).toEntity(data);
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should prepare checkout and return updated ticket")
  void shouldPrepareCheckout() {
    final UUID ticketId = UUID.randomUUID();
    final BigDecimal amount = new BigDecimal("15000.00");
    final ParkingTicketsData data = new ParkingTicketsData();
    final ParkingTickets entity = ParkingTickets.builder().id(ticketId).build();

    when(repository.findById(ticketId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final ParkingTickets result = adapter.prepareCheckout(ticketId, amount);

    assertThat(result).isEqualTo(entity);
    verify(repository).prepareCheckout(ticketId, amount);
    verify(repository).findById(ticketId);
    verify(mapper).toEntity(data);
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should throw ParkingTicketNotFound when preparing checkout for non-existing ticket")
  void shouldThrowParkingTicketNotFoundWhenPreparingCheckoutNonExistingTicket() {
    final UUID ticketId = UUID.randomUUID();
    final BigDecimal amount = new BigDecimal("15000.00");

    when(repository.findById(ticketId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> adapter.prepareCheckout(ticketId, amount))
      .isInstanceOf(ParkingTicketNotFound.class);

    verify(repository).prepareCheckout(ticketId, amount);
    verify(repository).findById(ticketId);
    verify(mapper, never()).toEntity(any());
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should change ticket status and return updated entity")
  void shouldChangeStatus() {
    final UUID ticketId = UUID.randomUUID();
    final ParkingTicketStatus status = ParkingTicketStatus.CLOSED;
    final ParkingTicketsData data = new ParkingTicketsData();
    final ParkingTickets entity = ParkingTickets.builder().id(ticketId).status(status).build();

    when(repository.findById(ticketId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final ParkingTickets result = adapter.changeStatus(ticketId, status);

    assertThat(result).isEqualTo(entity);
    verify(repository).changeStatus(ticketId, status);
    verify(repository).findById(ticketId);
    verify(mapper).toEntity(data);
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should return null when changing status for non-existing ticket")
  void shouldReturnNullWhenChangingStatusNonExistingTicket() {
    final UUID ticketId = UUID.randomUUID();
    final ParkingTicketStatus status = ParkingTicketStatus.CLOSED;

    when(repository.findById(ticketId)).thenReturn(Optional.empty());

    final ParkingTickets result = adapter.changeStatus(ticketId, status);

    assertThat(result).isNull();
    verify(repository).changeStatus(ticketId, status);
    verify(repository).findById(ticketId);
    verify(mapper, never()).toEntity(any());
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should close ticket, set closedAt, and mark slot AVAILABLE")
  void shouldCloseTicket() {
    final UUID ticketId = UUID.randomUUID();
    final ParkingTicketsData ticketData = new ParkingTicketsData();
    final SlotsData slotData = new SlotsData();
    slotData.setStatus(SlotStatus.OCCUPIED);
    ticketData.setSlot(slotData);

    final ParkingTickets closedEntity = ParkingTickets.builder()
      .id(ticketId)
      .status(ParkingTicketStatus.CLOSED)
      .build();

    when(repository.findById(ticketId)).thenReturn(Optional.of(ticketData));
    when(repository.save(ticketData)).thenReturn(ticketData);
    when(mapper.toEntity(ticketData)).thenReturn(closedEntity);

    final ParkingTickets result = adapter.closeTicket(ticketId);

    assertThat(result).isEqualTo(closedEntity);
    assertThat(ticketData.getStatus()).isEqualTo(ParkingTicketStatus.CLOSED);
    assertThat(ticketData.getClosedAt()).isNotNull();
    assertThat(slotData.getStatus()).isEqualTo(SlotStatus.AVAILABLE);
    verify(repository).findById(ticketId);
    verify(repository).save(ticketData);
    verify(mapper).toEntity(ticketData);
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should close ticket when slot is null without throwing NullPointerException")
  void shouldCloseTicketWhenSlotIsNull() {
    final UUID ticketId = UUID.randomUUID();
    final ParkingTicketsData ticketData = new ParkingTicketsData();
    ticketData.setSlot(null);

    final ParkingTickets closedEntity = ParkingTickets.builder()
      .id(ticketId)
      .status(ParkingTicketStatus.CLOSED)
      .build();

    when(repository.findById(ticketId)).thenReturn(Optional.of(ticketData));
    when(repository.save(ticketData)).thenReturn(ticketData);
    when(mapper.toEntity(ticketData)).thenReturn(closedEntity);

    final ParkingTickets result = adapter.closeTicket(ticketId);

    assertThat(result).isEqualTo(closedEntity);
    assertThat(ticketData.getStatus()).isEqualTo(ParkingTicketStatus.CLOSED);
    assertThat(ticketData.getClosedAt()).isNotNull();
    verify(repository).findById(ticketId);
    verify(repository).save(ticketData);
    verify(mapper).toEntity(ticketData);
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should return null and never save when closing nonexistent ticket")
  void shouldReturnNullWhenTicketNotFound() {
    final UUID ticketId = UUID.randomUUID();
    when(repository.findById(ticketId)).thenReturn(Optional.empty());

    final ParkingTickets result = adapter.closeTicket(ticketId);

    assertThat(result).isNull();
    verify(repository).findById(ticketId);
    verify(repository, never()).save(any());
    verify(mapper, never()).toEntity(any());
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should find active ticket by slot ID")
  void shouldFindActiveTicketBySlotId() {
    final UUID slotId = UUID.randomUUID();
    final ParkingTicketsData data = new ParkingTicketsData();
    final ParkingTickets entity = ParkingTickets.builder().id(UUID.randomUUID()).build();

    when(repository.findActiveBySlotId(slotId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final Optional<ParkingTickets> result = adapter.findActiveBySlotId(slotId);

    assertThat(result).isPresent().contains(entity);
    verify(repository).findActiveBySlotId(slotId);
    verify(mapper).toEntity(data);
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should return empty when no active ticket by slot ID")
  void shouldReturnEmptyWhenNoActiveTicketBySlotId() {
    final UUID slotId = UUID.randomUUID();

    when(repository.findActiveBySlotId(slotId)).thenReturn(Optional.empty());

    final Optional<ParkingTickets> result = adapter.findActiveBySlotId(slotId);

    assertThat(result).isEmpty();
    verify(repository).findActiveBySlotId(slotId);
    verify(mapper, never()).toEntity(any());
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should find all tickets by parking lot ID")
  void shouldFindAllByParkingLotId() {
    final UUID parkingLotId = UUID.randomUUID();
    final ParkingTicketsData data = new ParkingTicketsData();
    final ParkingTickets entity = ParkingTickets.builder().id(UUID.randomUUID()).build();

    when(repository.findAllBySlot_Parking_Id(parkingLotId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final List<ParkingTickets> result = adapter.findAllByParkingLotId(parkingLotId);

    assertThat(result).containsExactly(entity);
    verify(repository).findAllBySlot_Parking_Id(parkingLotId);
    verify(mapper).toEntity(data);
    verifyNoMoreInteractions(repository, mapper);
  }

  @Test
  @DisplayName("Should return empty list when no tickets found by parking lot ID")
  void shouldReturnEmptyListWhenNoTicketsByParkingLotId() {
    final UUID parkingLotId = UUID.randomUUID();

    when(repository.findAllBySlot_Parking_Id(parkingLotId)).thenReturn(List.of());

    final List<ParkingTickets> result = adapter.findAllByParkingLotId(parkingLotId);

    assertThat(result).isEmpty();
    verify(repository).findAllBySlot_Parking_Id(parkingLotId);
    verify(mapper, never()).toEntity(any());
    verifyNoMoreInteractions(repository, mapper);
  }
}
