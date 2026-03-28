package dev.angelcorzo.nivo.usecase.editslot;

import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.UUID;

import lombok.Builder;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class EditSlotUseCase {
  private final SlotsRepository slotsRepository;

  public Slots execute(UpdateSlotCommand command) {
    final Slots.SlotsBuilder slotsBuilder =
        this.slotsRepository
            .findById(command.id())
            .orElseThrow(() -> new SlotNotFoundException(command.id()))
            .toBuilder();

    return slotsBuilder
        .slotNumber(command.slotNumber())
        .type(command.type())
        .status(command.status())
        .build();
  }

  @Builder(toBuilder = true)
  public record UpdateSlotCommand(UUID id, String slotNumber, SlotType type, SlotStatus status) {}
}
