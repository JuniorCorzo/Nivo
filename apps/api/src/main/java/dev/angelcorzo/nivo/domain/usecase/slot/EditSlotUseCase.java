package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class EditSlotUseCase {
  private final SlotsRepository slotsRepository;

  public Slots execute(UpdateSlotCommand command) {
    final Slots existing =
        this.slotsRepository
            .findById(command.id())
            .orElseThrow(() -> new SlotNotFoundException(command.id()));

    if (existing.getStatus() == SlotStatus.OCCUPIED) {
      throw new SlotCannotBeModifiedException(
          "Slot cannot be modified because it is currently OCCUPIED: " + command.id(),
          List.of(command.id()));
    }

    if (command.status() == SlotStatus.OCCUPIED) {
      throw new SlotCannotBeModifiedException(
          "Slot cannot be manually transitioned to OCCUPIED. Vehicle check-in is required.",
          List.of(command.id()));
    }

    final Slots updatedSlot =
        existing.toBuilder()
            .slotNumber(command.slotNumber())
            .type(command.type())
            .status(command.status())
            .build();

    return this.slotsRepository.save(updatedSlot);
  }

  @Builder(toBuilder = true)
  public record UpdateSlotCommand(UUID id, String slotNumber, SlotType type, SlotStatus status) {}
}
