package dev.angelcorzo.nivo.usecase.createslot;

import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.parkinglots.valueobject.ParkingLotsReference;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.model.tenants.exceptions.TenantNotExistsException;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
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
    final Slots savedSlot = this.slotsRepository.save(slot);

    this.parkingLotsRepository.incrementTotalSpots(command.parkingLotId());

    return savedSlot;
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
