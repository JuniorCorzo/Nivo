package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.utils.SlotNumberUtils;
import dev.angelcorzo.nivo.domain.model.utils.StringUtils;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import lombok.Builder;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UpdateSlotGroupUseCase {
  private final SlotsRepository slotsRepository;
  private final BatchPersistSlotsUseCase batchPersistSlotsUseCase;

  public List<Slots> execute(UpdateSlotGroupCommand command) {
    final List<Slots> groupSlots = this.slotsRepository.findAllByParkingLotsIdAndZoneAndPrefix(
        command.parkingId(),
        command.currentZone(),
        command.currentPrefix()
    );

    if (groupSlots.isEmpty()) {
      return Collections.emptyList();
    }

    final List<UUID> conflictingIds = groupSlots.stream()
        .filter(slot -> slot.getStatus() != SlotStatus.AVAILABLE)
        .map(Slots::getId)
        .toList();

    if (!conflictingIds.isEmpty()) {
      throw new SlotCannotBeModifiedException(conflictingIds);
    }

    final String targetZone = command.resolveTargetZone();
    final String targetPrefix = command.resolveTargetPrefix();
    final boolean prefixChanged = command.isPrefixChanged();

    final List<Slots> updatedSlots = groupSlots.stream()
        .map(slot -> {
          Slots.SlotsBuilder builder = slot.toBuilder()
              .zone(targetZone)
              .prefix(targetPrefix);

          if (prefixChanged) {
            builder.slotNumber(SlotNumberUtils.recalculateSlotNumber(slot.getSlotNumber(), command.currentPrefix(), targetPrefix != null ? targetPrefix : ""));
          }

          return builder.build();
        })
        .toList();

    return this.batchPersistSlotsUseCase.execute(updatedSlots);
  }

  @Builder(toBuilder = true)
  public record UpdateSlotGroupCommand(
      UUID parkingId,
      String currentZone,
      String currentPrefix,
      String newZone,
      String newPrefix
  ) {
    public String resolveTargetZone() {
      return newZone != null ? StringUtils.normalize(newZone) : currentZone;
    }

    public String resolveTargetPrefix() {
      return newPrefix != null ? StringUtils.normalize(newPrefix) : currentPrefix;
    }

    public boolean isPrefixChanged() {
      return newPrefix != null
          && !Objects.equals(StringUtils.normalize(newPrefix), StringUtils.normalize(currentPrefix));
    }
  }
}
