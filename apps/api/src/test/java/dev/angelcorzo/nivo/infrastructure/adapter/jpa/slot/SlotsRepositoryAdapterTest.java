package dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotSummary;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers.SlotSummaryDataMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers.SlotsMappers;
import jakarta.persistence.Tuple;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("SlotsRepositoryAdapter Pure JPA Unit Tests")
class SlotsRepositoryAdapterTest {

  private SlotsRepositoryData repository;
  private SlotsMappers mapper;
  private SlotSummaryDataMapper summaryMapper;
  private SlotsRepositoryAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(SlotsRepositoryData.class);
    mapper = mock(SlotsMappers.class);
    summaryMapper = mock(SlotSummaryDataMapper.class);
    adapter = new SlotsRepositoryAdapter(repository, mapper, summaryMapper);
  }

  @Test
  @DisplayName("Should find all slot summaries by parking lots ID")
  void shouldFindAllSummaryByParkingLotsId() {
    final UUID parkingLotId = UUID.randomUUID();
    final Tuple tuple = mock(Tuple.class);
    final SlotSummaryData summaryData = mock(SlotSummaryData.class);
    final SlotSummary model = mock(SlotSummary.class);

    when(repository.findAllSummaryByParking_Id(parkingLotId)).thenReturn(List.of(tuple));
    when(summaryMapper.toSummaryData(tuple)).thenReturn(summaryData);
    when(summaryMapper.toModel(summaryData)).thenReturn(model);

    final List<SlotSummary> result = adapter.findAllSummaryByParkingLotsId(parkingLotId);

    assertThat(result).hasSize(1).containsExactly(model);
    verify(repository).findAllSummaryByParking_Id(parkingLotId);
  }

  @Test
  @DisplayName("Should find slots by IDs")
  void shouldFindAllById() {
    final UUID id = UUID.randomUUID();
    final SlotsData data = new SlotsData();
    final Slots entity = Slots.builder().id(id).build();

    when(repository.findAllById(List.of(id))).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final List<Slots> result = adapter.findAllById(List.of(id));

    assertThat(result).containsExactly(entity);
  }

  @Test
  @DisplayName("Should find slots by IDs and tenant ID")
  void shouldFindAllByIdInAndTenantId() {
    final UUID id = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final SlotsData data = new SlotsData();
    final Slots entity = Slots.builder().id(id).build();

    when(repository.findAllByIdInAndTenant_Id(List.of(id), tenantId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final List<Slots> result = adapter.findAllByIdInAndTenantId(List.of(id), tenantId);

    assertThat(result).containsExactly(entity);
  }

  @Test
  @DisplayName("Should soft delete by parking lot ID")
  void shouldSoftDeleteByParkingLotId() {
    final UUID parkingLotId = UUID.randomUUID();
    when(repository.softDeleteByParkingLotsId(parkingLotId)).thenReturn(5);

    final int result = adapter.softDeleteByParkingLotsId(parkingLotId);

    assertThat(result).isEqualTo(5);
    verify(repository).softDeleteByParkingLotsId(parkingLotId);
  }

  @Test
  @DisplayName("Should batch delete slots")
  void shouldBatchDelete() {
    final List<UUID> ids = List.of(UUID.randomUUID(), UUID.randomUUID());

    adapter.batchDelete(ids);

    verify(repository).deleteAllByIdInBatch(ids);
  }

  @Test
  @DisplayName("Should batch delete slots with tenantId using soft delete")
  void shouldBatchDeleteWithTenantId() {
    final List<UUID> ids = List.of(UUID.randomUUID(), UUID.randomUUID());
    final UUID tenantId = UUID.randomUUID();

    adapter.batchDelete(ids, tenantId);

    verify(repository).softDeleteByIdsAndTenantId(ids, tenantId);
  }

  @Test
  @DisplayName("Should fallback to deleteAllByIdInBatch when tenantId is null")
  void shouldBatchDeleteFallbackWhenTenantIdIsNull() {
    final List<UUID> ids = List.of(UUID.randomUUID());

    adapter.batchDelete(ids, null);

    verify(repository).deleteAllByIdInBatch(ids);
  }
}
