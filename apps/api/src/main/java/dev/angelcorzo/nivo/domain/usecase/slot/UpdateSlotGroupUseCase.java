package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
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
  private final AuthenticationContextGateway authenticationContext;

  public List<Slots> execute(UpdateSlotGroupCommand command) {
    final Tenants tenant = this.authenticationContext.getCurrentTenant();

    final List<Slots> allSlots = this.slotsRepository.findAllByParkingLotsId(command.parkingId());

    final List<Slots> groupSlots = allSlots.stream()
        .filter(slot -> tenant == null || tenant.getId() == null
            || slot.getTenant() == null || slot.getTenant().id() == null
            || slot.getTenant().id().equals(tenant.getId()))
        .filter(slot -> Objects.equals(StringUtils.normalize(slot.getPrefix()), StringUtils.normalize(command.currentPrefix()))
            && Objects.equals(StringUtils.normalize(slot.getZone()), StringUtils.normalize(command.currentZone())))
        .toList();

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

    final String targetZone = command.newZone() != null ? command.newZone() : command.currentZone();
    final String targetPrefix = command.newPrefix() != null ? command.newPrefix() : command.currentPrefix();
    final boolean prefixChanged = command.newPrefix() != null && !command.newPrefix().equals(command.currentPrefix());

    final List<Slots> updatedSlots = groupSlots.stream()
        .map(slot -> {
          Slots.SlotsBuilder builder = slot.toBuilder()
              .zone(targetZone)
              .prefix(targetPrefix);

          if (prefixChanged) {
            builder.slotNumber(recalculateSlotNumber(slot.getSlotNumber(), command.currentPrefix(), targetPrefix));
          }

          return builder.build();
        })
        .toList();

    return this.slotsRepository.saveAll(updatedSlots);
  }

  private String recalculateSlotNumber(String oldSlotNumber, String oldPrefix, String newPrefix) {
    if (newPrefix == null || newPrefix.equals(oldPrefix)) {
      return oldSlotNumber;
    }
    if (oldSlotNumber == null) {
      return null;
    }
    if (oldPrefix != null && !oldPrefix.isEmpty()) {
      if (oldSlotNumber.startsWith(oldPrefix + "-")) {
        return newPrefix + "-" + oldSlotNumber.substring(oldPrefix.length() + 1);
      } else if (oldSlotNumber.startsWith(oldPrefix)) {
        return newPrefix + oldSlotNumber.substring(oldPrefix.length());
      }
    }
    return newPrefix + "-" + oldSlotNumber;
  }

  @Builder(toBuilder = true)
  public record UpdateSlotGroupCommand(
      UUID parkingId,
      String currentZone,
      String currentPrefix,
      String newZone,
      String newPrefix
  ) {}
}
