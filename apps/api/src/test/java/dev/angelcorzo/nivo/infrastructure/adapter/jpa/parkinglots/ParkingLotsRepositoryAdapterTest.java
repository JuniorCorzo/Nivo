package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.mappers.ParkingLotSummaryDataMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.mappers.ParkingLotsMapper;
import jakarta.persistence.Tuple;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ParkingLotsRepositoryAdapter Pure JPA Unit Tests")
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
    final UUID tenantId = UUID.randomUUID();
    final Tuple tuple = mock(Tuple.class);
    final ParkingLotSummaryData summaryData = mock(ParkingLotSummaryData.class);
    final ParkingLotListItem listItem = mock(ParkingLotListItem.class);

    when(repository.findAllByTenantId(tenantId)).thenReturn(List.of(tuple));
    when(summaryMapper.toSummaryData(tuple)).thenReturn(summaryData);
    when(mapper.toListItem(summaryData)).thenReturn(listItem);

    final List<ParkingLotListItem> result = adapter.findByTenantId(tenantId);

    assertThat(result).hasSize(1).containsExactly(listItem);
    verify(repository).findAllByTenantId(tenantId);
  }

  @Test
  @DisplayName("Should find parking lots by owner ID")
  void shouldFindByOwnerId() {
    final UUID ownerId = UUID.randomUUID();
    final ParkingLotsData data = new ParkingLotsData();
    final ParkingLots entity = ParkingLots.builder().id(UUID.randomUUID()).build();

    when(repository.findAllByOwnerId(ownerId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final List<ParkingLots> result = adapter.findByOwnerId(ownerId);

    assertThat(result).hasSize(1).containsExactly(entity);
    verify(repository).findAllByOwnerId(ownerId);
  }

  @Test
  @DisplayName("Should find parking lot by ID")
  void shouldFindById() {
    final UUID id = UUID.randomUUID();
    final ParkingLotsData data = new ParkingLotsData();
    final ParkingLots entity = ParkingLots.builder().id(id).build();

    when(repository.findById(id)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final Optional<ParkingLots> result = adapter.findById(id);

    assertThat(result).isPresent().contains(entity);
    verify(repository).findById(id);
  }

  @Test
  @DisplayName("Should get reference by ID")
  void shouldGetReferenceById() {
    final UUID id = UUID.randomUUID();
    final ParkingLotsData data = new ParkingLotsData();
    final ParkingLots entity = ParkingLots.builder().id(id).build();

    when(repository.getReferenceById(id)).thenReturn(data);
    when(mapper.toEntity(data)).thenReturn(entity);

    final ParkingLots result = adapter.getReferenceById(id);

    assertThat(result).isEqualTo(entity);
    verify(repository).getReferenceById(id);
  }

  @Test
  @DisplayName("Should check existence by ID")
  void shouldCheckExistsById() {
    final UUID id = UUID.randomUUID();
    when(repository.existsById(id)).thenReturn(true);

    assertThat(adapter.existsById(id)).isTrue();
    verify(repository).existsById(id);
  }

  @Test
  @DisplayName("Should delete parking lot entity")
  void shouldDelete() {
    final ParkingLots entity = ParkingLots.builder().id(UUID.randomUUID()).build();
    final ParkingLotsData data = new ParkingLotsData();
    when(mapper.toData(entity)).thenReturn(data);

    adapter.delete(entity);

    verify(repository).delete(data);
  }

  @Test
  @DisplayName("Should do nothing when deleting null entity")
  void shouldDoNothingWhenDeletingNull() {
    adapter.delete(null);

    verifyNoInteractions(repository);
  }
}
