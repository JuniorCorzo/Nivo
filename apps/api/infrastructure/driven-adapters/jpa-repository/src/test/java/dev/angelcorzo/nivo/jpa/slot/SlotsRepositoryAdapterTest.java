package dev.angelcorzo.nivo.jpa.slot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.slot.mappers.SlotSummaryDataMapper;
import dev.angelcorzo.nivo.jpa.slot.mappers.SlotsMappers;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.valueobject.SlotSummary;
import jakarta.persistence.Tuple;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("SlotsRepositoryAdapter Unit Tests")
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
  @DisplayName("Should find all slots by parking lots ID")
  void shouldFindAllByParkingLotId() {
    UUID parkingId = UUID.randomUUID();
    SlotsData data = new SlotsData();
    Slots slot = Slots.builder().id(UUID.randomUUID()).build();

    when(repository.findAllByParking_Id(parkingId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(slot);

    List<Slots> result = adapter.findAllByParkingLotsId(parkingId);

    assertThat(result).hasSize(1);
    verify(repository).findAllByParking_Id(parkingId);
  }

  @Test
  @DisplayName("Should find all slot summaries by parking lot ID")
  void shouldFindAllSummaryByParkingLotId() {
    UUID parkingId = UUID.randomUUID();
    Tuple tuple = mock(Tuple.class);
    SlotSummaryData summaryData = mock(SlotSummaryData.class);
    SlotSummary model = mock(SlotSummary.class);

    when(repository.findAllSummaryByParking_Id(parkingId)).thenReturn(List.of(tuple));
    when(summaryMapper.toSummaryData(tuple)).thenReturn(summaryData);
    when(summaryMapper.toModel(summaryData)).thenReturn(model);

    List<SlotSummary> result = adapter.findAllSummaryByParkingLotsId(parkingId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0)).isEqualTo(model);
  }

  @Test
  @DisplayName("Should soft delete slots by parking lot ID")
  void shouldSoftDeleteByParkingLotId() {
    UUID parkingId = UUID.randomUUID();
    when(repository.softDeleteByParkingLotsId(parkingId)).thenReturn(5);

    int count = adapter.softDeleteByParkingLotsId(parkingId);

    assertThat(count).isEqualTo(5);
    verify(repository).softDeleteByParkingLotsId(parkingId);
  }

  @Test
  @DisplayName("Should batch delete slots by IDs")
  void shouldBatchDeleteSlots() {
    List<UUID> ids = List.of(UUID.randomUUID(), UUID.randomUUID());

    adapter.batchDelete(ids);

    verify(repository).deleteAllByIdInBatch(ids);
  }
}
