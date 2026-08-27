package dev.angelcorzo.nivo.usecase.listslotsummary;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.model.slots.valueobject.SlotSummary;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ListSlotsSummaryUseCase Tests")
class ListSlotsSummaryUseCaseTest {

  private SlotsRepository slotsRepository;
  private ListSlotsSummaryUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    useCase = new ListSlotsSummaryUseCase(slotsRepository);
  }

  @Test
  @DisplayName("Should return slots summary for parking lot")
  void shouldReturnSlotsSummary() {
    UUID parkingId = UUID.randomUUID();
    UUID slotId = UUID.randomUUID();
    SlotSummary summary =
        new SlotSummary(slotId, "Main Lot", SlotType.CAR, "A", "Zone-1", "A-01", SlotStatus.AVAILABLE, false, false);

    when(slotsRepository.findAllSummaryByParkingLotsId(parkingId)).thenReturn(List.of(summary));

    List<SlotSummary> result = useCase.execute(parkingId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).prefix()).isEqualTo("A");
    assertThat(result.get(0).numberSlot()).isEqualTo("A-01");
    verify(slotsRepository).findAllSummaryByParkingLotsId(parkingId);
  }
}
