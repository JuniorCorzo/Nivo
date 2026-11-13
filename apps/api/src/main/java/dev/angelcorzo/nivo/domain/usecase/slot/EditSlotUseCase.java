package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import org.springframework.beans.factory.annotation.Autowired;

public class EditSlotUseCase {
  private final SlotsRepository slotsRepository;
  private final AuthenticationContextGateway authenticationContext;

  @Autowired
  public EditSlotUseCase(SlotsRepository slotsRepository, AuthenticationContextGateway authenticationContext) {
    this.slotsRepository = slotsRepository;
    this.authenticationContext = authenticationContext;
  }

  public EditSlotUseCase(SlotsRepository slotsRepository) {
    this(slotsRepository, null);
  }

  public Slots execute(UpdateSlotCommand command) {
    final UUID currentTenantId = this.authenticationContext != null
      ? this.authenticationContext.getCurrentTenantId()
      : null;
    return this.execute(command, currentTenantId);
  }

  public Slots execute(UpdateSlotCommand command, UUID tenantId) {
    final Slots existing = this.slotsRepository.findById(command.id())
      .orElseThrow(() -> new SlotNotFoundException(command.id()));

    if (tenantId != null && existing.getTenant() != null && !tenantId.equals(existing.getTenant().id())) {
      throw new SlotNotFoundException(command.id());
    }

    if (existing.getStatus() == SlotStatus.OCCUPIED) {
      throw new SlotCannotBeModifiedException(
        "Slot cannot be modified because it is currently OCCUPIED: " + command.id(), List.of(command.id()));
    }

    if (command.status() == SlotStatus.OCCUPIED) {
      throw new SlotCannotBeModifiedException(
        "Slot cannot be manually transitioned to OCCUPIED. Vehicle check-in is required.",
        List.of(command.id()));
    }

    final Slots updatedSlot = existing.toBuilder()
      .slotNumber(command.slotNumber())
      .type(command.type())
      .status(command.status())
      .build();

    return this.slotsRepository.save(updatedSlot);
  }

  @Builder(toBuilder = true)
  public record UpdateSlotCommand(UUID id, String slotNumber, SlotType type, SlotStatus status) {
  }
}
