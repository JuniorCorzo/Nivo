package dev.angelcorzo.nivo.domain.usecase.slot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
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
  @DisplayName("Should edit slot successfully from AVAILABLE to MAINTENANCE and persist")
  void shouldEditSlotFromAvailableToMaintenance() {
    UUID slotId = UUID.randomUUID();
    EditSlotUseCase.UpdateSlotCommand command =
        new EditSlotUseCase.UpdateSlotCommand(slotId, "S-202", SlotType.MOTORCYCLE, SlotStatus.MAINTENANCE);

    Slots existing =
        Slots.builder()
            .id(slotId)
            .slotNumber("S-101")
            .type(SlotType.CAR)
            .status(SlotStatus.AVAILABLE)
            .build();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(existing));
    when(slotsRepository.save(any(Slots.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Slots result = useCase.execute(command);

    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(slotId);
    assertThat(result.getSlotNumber()).isEqualTo("S-202");
    assertThat(result.getType()).isEqualTo(SlotType.MOTORCYCLE);
    assertThat(result.getStatus()).isEqualTo(SlotStatus.MAINTENANCE);

    verify(slotsRepository).findById(slotId);
    verify(slotsRepository).save(any(Slots.class));
  }

  @Test
  @DisplayName("Should edit slot successfully from MAINTENANCE to AVAILABLE and persist")
  void shouldEditSlotFromMaintenanceToAvailable() {
    UUID slotId = UUID.randomUUID();
    EditSlotUseCase.UpdateSlotCommand command =
        new EditSlotUseCase.UpdateSlotCommand(slotId, "S-101", SlotType.CAR, SlotStatus.AVAILABLE);

    Slots existing =
        Slots.builder()
            .id(slotId)
            .slotNumber("S-101")
            .type(SlotType.CAR)
            .status(SlotStatus.MAINTENANCE)
            .build();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(existing));
    when(slotsRepository.save(any(Slots.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Slots result = useCase.execute(command);

    assertThat(result).isNotNull();
    assertThat(result.getStatus()).isEqualTo(SlotStatus.AVAILABLE);

    verify(slotsRepository).save(any(Slots.class));
  }

  @Test
  @DisplayName("Should edit slot successfully from AVAILABLE to RESERVED and persist")
  void shouldEditSlotFromAvailableToReserved() {
    UUID slotId = UUID.randomUUID();
    EditSlotUseCase.UpdateSlotCommand command =
        new EditSlotUseCase.UpdateSlotCommand(slotId, "S-101", SlotType.CAR, SlotStatus.RESERVED);

    Slots existing =
        Slots.builder()
            .id(slotId)
            .slotNumber("S-101")
            .type(SlotType.CAR)
            .status(SlotStatus.AVAILABLE)
            .build();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(existing));
    when(slotsRepository.save(any(Slots.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Slots result = useCase.execute(command);

    assertThat(result).isNotNull();
    assertThat(result.getStatus()).isEqualTo(SlotStatus.RESERVED);

    verify(slotsRepository).save(any(Slots.class));
  }

  @Test
  @DisplayName("Should edit slot configuration keeping AVAILABLE status and persist")
  void shouldEditSlotConfigurationKeepingSameStatus() {
    UUID slotId = UUID.randomUUID();
    EditSlotUseCase.UpdateSlotCommand command =
        new EditSlotUseCase.UpdateSlotCommand(slotId, "S-102", SlotType.BIKE, SlotStatus.AVAILABLE);

    Slots existing =
        Slots.builder()
            .id(slotId)
            .slotNumber("S-101")
            .type(SlotType.CAR)
            .status(SlotStatus.AVAILABLE)
            .build();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(existing));
    when(slotsRepository.save(any(Slots.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Slots result = useCase.execute(command);

    assertThat(result).isNotNull();
    assertThat(result.getSlotNumber()).isEqualTo("S-102");
    assertThat(result.getType()).isEqualTo(SlotType.BIKE);
    assertThat(result.getStatus()).isEqualTo(SlotStatus.AVAILABLE);

    verify(slotsRepository).save(any(Slots.class));
  }

  @Test
  @DisplayName("Should throw SlotCannotBeModifiedException when existing slot is OCCUPIED")
  void shouldThrowWhenExistingSlotIsOccupied() {
    UUID slotId = UUID.randomUUID();
    EditSlotUseCase.UpdateSlotCommand command =
        new EditSlotUseCase.UpdateSlotCommand(slotId, "S-101", SlotType.CAR, SlotStatus.MAINTENANCE);

    Slots existing =
        Slots.builder()
            .id(slotId)
            .slotNumber("S-101")
            .type(SlotType.CAR)
            .status(SlotStatus.OCCUPIED)
            .build();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(SlotCannotBeModifiedException.class)
        .hasMessageContaining("Slot cannot be modified because it is currently OCCUPIED: " + slotId);

    verify(slotsRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should throw SlotCannotBeModifiedException when target status is OCCUPIED")
  void shouldThrowWhenTargetStatusIsOccupied() {
    UUID slotId = UUID.randomUUID();
    EditSlotUseCase.UpdateSlotCommand command =
        new EditSlotUseCase.UpdateSlotCommand(slotId, "S-101", SlotType.CAR, SlotStatus.OCCUPIED);

    Slots existing =
        Slots.builder()
            .id(slotId)
            .slotNumber("S-101")
            .type(SlotType.CAR)
            .status(SlotStatus.AVAILABLE)
            .build();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(SlotCannotBeModifiedException.class)
        .hasMessageContaining("Slot cannot be manually transitioned to OCCUPIED. Vehicle check-in is required.");

    verify(slotsRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should throw SlotNotFoundException when slot does not exist")
  void shouldThrowWhenSlotNotFound() {
    UUID slotId = UUID.randomUUID();
    EditSlotUseCase.UpdateSlotCommand command =
        new EditSlotUseCase.UpdateSlotCommand(slotId, "S-202", SlotType.MOTORCYCLE, SlotStatus.MAINTENANCE);

    when(slotsRepository.findById(slotId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(SlotNotFoundException.class);

    verify(slotsRepository, never()).save(any());
  }
}
