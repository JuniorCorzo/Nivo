package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UpdateSlotMetadataUseCase {
  private final SlotsRepository slotsRepository;
  private final AuthenticationContextGateway authenticationContext;

  public List<Slots> execute(UpdateSlotMetadataCommand command) {
    final Tenants tenant = this.authenticationContext.getCurrentTenant();
    final List<Slots> slots = this.slotsRepository.findAllById(command.slotIds());

    final Set<UUID> foundIds = slots.stream()
        .filter(s -> tenant == null || tenant.getId() == null
            || s.getTenant() == null || s.getTenant().id() == null
            || s.getTenant().id().equals(tenant.getId()))
        .map(Slots::getId)
        .collect(Collectors.toSet());

    for (UUID requestedId : command.slotIds()) {
      if (!foundIds.contains(requestedId)) {
        throw new SlotNotFoundException(requestedId);
      }
    }

    final List<UUID> conflictingIds = slots.stream()
        .filter(s -> s.getStatus() != SlotStatus.AVAILABLE)
        .map(Slots::getId)
        .toList();

    if (!conflictingIds.isEmpty()) {
      throw new SlotCannotBeModifiedException(conflictingIds);
    }

    final List<Slots> updatedSlots = slots.stream()
        .map(s -> {
          Slots.SlotsBuilder builder = s.toBuilder();
          if (command.hasCharger() != null) builder.hasCharger(command.hasCharger());
          if (command.isAccessible() != null) builder.isAccessible(command.isAccessible());
          if (command.isActive() != null) builder.isActive(command.isActive());
          return builder.build();
        })
        .toList();

    return this.slotsRepository.saveAll(updatedSlots);
  }

  @Builder(toBuilder = true)
  public record UpdateSlotMetadataCommand(
      List<UUID> slotIds,
      Boolean hasCharger,
      Boolean isAccessible,
      Boolean isActive
  ) {}
}
