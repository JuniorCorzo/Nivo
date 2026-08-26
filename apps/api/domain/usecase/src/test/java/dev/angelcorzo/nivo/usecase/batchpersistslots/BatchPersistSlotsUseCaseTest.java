package dev.angelcorzo.nivo.usecase.batchpersistslots;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("BatchPersistSlotsUseCase Tests")
class BatchPersistSlotsUseCaseTest {

  private SlotsRepository slotsRepository;
  private BatchPersistSlotsUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    useCase = new BatchPersistSlotsUseCase(slotsRepository);
  }

  @Test
  @DisplayName("Should persist slots in batches of 50")
  void shouldPersistSlotsInBatches() {
    // Arrange: create 120 slots
    List<Slots> slots = new ArrayList<>();
    for (int i = 0; i < 120; i++) {
      slots.add(Slots.builder().id(UUID.randomUUID()).slotNumber("S-" + i).build());
    }

    when(slotsRepository.saveAllEntities(anyList())).thenAnswer(i -> i.getArgument(0));

    // Act
    List<Slots> result = useCase.execute(slots);

    // Assert
    assertThat(result).hasSize(120);
    // 120 items in chunks of 50 -> 3 batches (50 + 50 + 20)
    verify(slotsRepository, times(3)).saveAllEntities(anyList());
  }

  @Test
  @DisplayName("Should handle empty list without errors")
  void shouldHandleEmptyList() {
    List<Slots> result = useCase.execute(List.of());

    assertThat(result).isEmpty();
    verify(slotsRepository, never()).saveAllEntities(anyList());
  }
}
