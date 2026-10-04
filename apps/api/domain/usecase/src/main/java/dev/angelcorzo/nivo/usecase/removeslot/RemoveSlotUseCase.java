package dev.angelcorzo.nivo.usecase.removeslot;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class RemoveSlotUseCase {
  private final SlotsRepository slotsRepository;
  private final ParkingLotsRepository parkingLotsRepository;
  private final AuthenticationContextGateway authenticationContext;

  public void execute(UUID id) {
    this.execute(id, this.authenticationContext.getCurrentTenantId());
  }

  public void execute(UUID id, UUID tenantId) {
    final Slots slot =
        this.slotsRepository
            .findById(id)
            .orElseThrow(() -> new SlotNotFoundException(id));

    if (slot.getTenant() == null || !tenantId.equals(slot.getTenant().id())) {
      throw new SlotNotFoundException(id);
    }

    this.slotsRepository.deleteById(id);
  }
}
