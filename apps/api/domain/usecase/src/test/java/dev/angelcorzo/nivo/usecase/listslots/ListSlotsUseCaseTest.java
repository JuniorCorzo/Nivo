package dev.angelcorzo.nivo.usecase.listslots;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ListSlotsUseCase Tests")
class ListSlotsUseCaseTest {

  private SlotsRepository slotsRepository;
  private ListSlotsUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    useCase = new ListSlotsUseCase(slotsRepository);
  }

  @Test
  @DisplayName("Should list all slots for parking lot")
  void shouldListAllSlotsForParkingLot() {
    UUID parkingId = UUID.randomUUID();
    Slots slot = Slots.builder().id(UUID.randomUUID()).slotNumber("A-01").build();

    when(slotsRepository.findAllByParkingLotsId(parkingId)).thenReturn(List.of(slot));

    List<Slots> result = useCase.execute(parkingId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getSlotNumber()).isEqualTo("A-01");
    verify(slotsRepository).findAllByParkingLotsId(parkingId);
  }
}
