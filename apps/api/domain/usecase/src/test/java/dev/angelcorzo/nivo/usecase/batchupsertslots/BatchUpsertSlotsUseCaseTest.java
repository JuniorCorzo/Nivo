package dev.angelcorzo.nivo.usecase.batchupsertslots;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.model.slots.valueobject.CreatedSlots;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.usecase.batchpersistslots.BatchPersistSlotsUseCase;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("BatchUpsertSlotsUseCase Tests")
class BatchUpsertSlotsUseCaseTest {

  private SlotsRepository slotsRepository;
  private BatchPersistSlotsUseCase batchPersistSlotsUseCase;
  private BatchUpsertSlotsUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    batchPersistSlotsUseCase = mock(BatchPersistSlotsUseCase.class);
    useCase = new BatchUpsertSlotsUseCase(slotsRepository, batchPersistSlotsUseCase);
  }

  @Test
  @DisplayName("Should create new groups when no existing slots in group")
  void shouldCreateNewGroups() {
    UUID parkingId = UUID.randomUUID();
    ParkingLots parking = ParkingLots.builder().id(parkingId).build();
    Tenants tenant = Tenants.builder().id(UUID.randomUUID()).build();

    CreatedSlots incoming = new CreatedSlots("A", "Zone-1", SlotType.CAR, 5, 0);

    when(slotsRepository.findAllByParkingLotsId(parkingId)).thenReturn(Collections.emptyList());

    useCase.execute(List.of(incoming), parking, tenant);

    verify(batchPersistSlotsUseCase).execute(anyList());
  }

  @Test
  @DisplayName("Should expand group when incoming count is greater than existing")
  void shouldExpandGroup() {
    UUID parkingId = UUID.randomUUID();
    ParkingLots parking = ParkingLots.builder().id(parkingId).build();
    Tenants tenant = Tenants.builder().id(UUID.randomUUID()).build();

    List<Slots> existing = new ArrayList<>();
    for (int i = 0; i < 3; i++) {
      existing.add(
          Slots.builder()
              .id(UUID.randomUUID())
              .prefix("A")
              .zone("Zone-1")
              .type(SlotType.CAR)
              .slotNumber("A-0" + (i + 1))
              .createdAt(OffsetDateTime.now())
              .build());
    }

    CreatedSlots incoming = new CreatedSlots("A", "Zone-1", SlotType.CAR, 5, 0);

    when(slotsRepository.findAllByParkingLotsId(parkingId)).thenReturn(existing);

    useCase.execute(List.of(incoming), parking, tenant);

    verify(batchPersistSlotsUseCase).execute(anyList());
  }

  @Test
  @DisplayName("Should shrink group when incoming count is less than existing")
  void shouldShrinkGroup() {
    UUID parkingId = UUID.randomUUID();
    ParkingLots parking = ParkingLots.builder().id(parkingId).build();
    Tenants tenant = Tenants.builder().id(UUID.randomUUID()).build();

    List<Slots> existing = new ArrayList<>();
    for (int i = 0; i < 5; i++) {
      existing.add(
          Slots.builder()
              .id(UUID.randomUUID())
              .prefix("A")
              .zone("Zone-1")
              .type(SlotType.CAR)
              .slotNumber("A-0" + (i + 1))
              .createdAt(OffsetDateTime.now().minusMinutes(i))
              .build());
    }

    CreatedSlots incoming = new CreatedSlots("A", "Zone-1", SlotType.CAR, 3, 0);

    when(slotsRepository.findAllByParkingLotsId(parkingId)).thenReturn(existing);

    useCase.execute(List.of(incoming), parking, tenant);

    // 2 excess slots should be deleted
    verify(slotsRepository, times(2)).deleteById(any(UUID.class));
  }
}
