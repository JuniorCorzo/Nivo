package dev.angelcorzo.nivo.usecase.editslot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("EditSlotUseCase Tests")
class EditSlotUseCaseTest {

  private SlotsRepository slotsRepository;
  private EditSlotUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    useCase = new EditSlotUseCase(slotsRepository);
  }

  @Test
  @DisplayName("Should edit slot successfully")
  void shouldEditSlotSuccessfully() {
    UUID slotId = UUID.randomUUID();
    EditSlotUseCase.UpdateSlotCommand command =
        new EditSlotUseCase.UpdateSlotCommand(slotId, "S-202", SlotType.MOTORCYCLE, SlotStatus.OCCUPIED);

    Slots existing =
        Slots.builder()
            .id(slotId)
            .slotNumber("S-101")
            .type(SlotType.CAR)
            .status(SlotStatus.AVAILABLE)
            .build();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(existing));

    Slots result = useCase.execute(command);

    assertThat(result).isNotNull();
    assertThat(result.getSlotNumber()).isEqualTo("S-202");
    assertThat(result.getType()).isEqualTo(SlotType.MOTORCYCLE);
    assertThat(result.getStatus()).isEqualTo(SlotStatus.OCCUPIED);
  }

  @Test
  @DisplayName("Should throw SlotNotFoundException when slot does not exist")
  void shouldThrowWhenSlotNotFound() {
    UUID slotId = UUID.randomUUID();
    EditSlotUseCase.UpdateSlotCommand command =
        new EditSlotUseCase.UpdateSlotCommand(slotId, "S-202", SlotType.MOTORCYCLE, SlotStatus.OCCUPIED);

    when(slotsRepository.findById(slotId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(SlotNotFoundException.class);
  }
}
