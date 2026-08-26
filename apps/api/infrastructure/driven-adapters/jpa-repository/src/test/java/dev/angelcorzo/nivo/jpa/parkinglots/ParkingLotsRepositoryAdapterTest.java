package dev.angelcorzo.nivo.jpa.parkinglots;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.parkinglots.mappers.ParkingLotSummaryDataMapper;
import dev.angelcorzo.nivo.jpa.parkinglots.mappers.ParkingLotsMapper;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import jakarta.persistence.Tuple;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ParkingLotsRepositoryAdapter Unit Tests")
class ParkingLotsRepositoryAdapterTest {

  private ParkingLotsRepositoryData repository;
  private ParkingLotSummaryDataMapper summaryMapper;
  private ParkingLotsMapper mapper;
  private ParkingLotsRepositoryAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(ParkingLotsRepositoryData.class);
    summaryMapper = mock(ParkingLotSummaryDataMapper.class);
    mapper = mock(ParkingLotsMapper.class);
    adapter = new ParkingLotsRepositoryAdapter(repository, summaryMapper, mapper);
  }

  @Test
  @DisplayName("Should find parking lots by tenant ID")
  void shouldFindByTenantId() {
    UUID tenantId = UUID.randomUUID();
    Tuple tuple = mock(Tuple.class);
    ParkingLotSummaryData summaryData = mock(ParkingLotSummaryData.class);
    ParkingLotListItem listItem = mock(ParkingLotListItem.class);

    when(repository.findAllByTenantId(tenantId)).thenReturn(List.of(tuple));
    when(summaryMapper.toSummaryData(tuple)).thenReturn(summaryData);
    when(mapper.toListItem(summaryData)).thenReturn(listItem);

    List<ParkingLotListItem> result = adapter.findByTenantId(tenantId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0)).isEqualTo(listItem);
  }

  @Test
  @DisplayName("Should check existence by ID")
  void shouldCheckExistsById() {
    UUID id = UUID.randomUUID();
    when(repository.existsById(id)).thenReturn(true);

    assertThat(adapter.existsById(id)).isTrue();
    verify(repository).existsById(id);
  }

  @Test
  @DisplayName("Should delete parking lot entity")
  void shouldDeleteParkingLot() {
    ParkingLots parkingLots = ParkingLots.builder().id(UUID.randomUUID()).build();
    ParkingLotsData data = new ParkingLotsData();

    when(mapper.toData(parkingLots)).thenReturn(data);

    adapter.delete(parkingLots);

    verify(repository).delete(data);
  }
}
