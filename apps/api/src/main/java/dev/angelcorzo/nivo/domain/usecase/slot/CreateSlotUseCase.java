package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.ParkingLotsReference;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.exceptions.TenantNotExistsException;
import dev.angelcorzo.nivo.domain.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import java.util.UUID;

import lombok.Builder;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CreateSlotUseCase {
  private final SlotsRepository slotsRepository;
  private final TenantsRepository tenantsRepository;
  private final ParkingLotsRepository parkingLotsRepository;

  public Slots execute(CreateSlotCommand command) {
    this.validate(command);

    final Slots slot =
        Slots.builder()
            .tenant(TenantReference.of(this.tenantsRepository.getReferenceById(command.tenantId())))
            .parking(
                ParkingLotsReference.of(
                    this.parkingLotsRepository.getReferenceById(command.parkingLotId())))
            .slotNumber(command.slotNumber())
            .type(command.type())
            .status(SlotStatus.AVAILABLE)
            .build();

	  return this.slotsRepository.save(slot);
  }

  private void validate(CreateSlotCommand command) {
    if (!this.tenantsRepository.existsById(command.tenantId()))
      throw new TenantNotExistsException(command.tenantId());

    if (!this.parkingLotsRepository.existsById(command.parkingLotId()))
      throw new ParkingNotExistsException(command.parkingLotId());
  }

  @Builder(toBuilder = true)
  public record CreateSlotCommand(UUID parkingLotId, UUID tenantId, String slotNumber, SlotType type) {}
}
