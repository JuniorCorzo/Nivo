package dev.angelcorzo.nivo.usecase.batchdeleteslots;

import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("BatchDeleteSlotsUseCase Tests")
class BatchDeleteSlotsUseCaseTest {

  private SlotsRepository slotsRepository;
  private BatchDeleteSlotsUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    useCase = new BatchDeleteSlotsUseCase(slotsRepository);
  }

  @Test
  @DisplayName("Should batch delete slots by ids")
  void shouldBatchDeleteSlots() {
    List<UUID> slotIds = List.of(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());

    useCase.execute(slotIds);

    verify(slotsRepository).batchDelete(slotIds);
  }
}
