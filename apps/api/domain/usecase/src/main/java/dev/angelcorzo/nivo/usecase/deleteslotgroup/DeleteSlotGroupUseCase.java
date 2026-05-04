package dev.angelcorzo.nivo.usecase.deleteslotgroup;

import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.model.utils.StringUtils;
import lombok.Builder;
import lombok.RequiredArgsConstructor;

import java.util.Objects;
import java.util.UUID;

@RequiredArgsConstructor
public class DeleteSlotGroupUseCase {

    private final SlotsRepository slotsRepository;
    private final ParkingLotsRepository parkingLotsRepository;

    public void execute(DeleteSlotGroupCommand command) {
        if (!this.parkingLotsRepository.existsById(command.parkingId()))
            throw new ParkingNotExistsException(command.parkingId());

        this.slotsRepository.findAllByParkingLotsId(command.parkingId()).stream()
                .filter(slot -> slot.getType() == command.slotType()
                        && Objects.equals(StringUtils.normalize(slot.getPrefix()), StringUtils.normalize(command.prefix()))
                        && Objects.equals(StringUtils.normalize(slot.getZone()), StringUtils.normalize(command.zone())))
                .forEach(slot -> this.slotsRepository.deleteById(slot.getId()));
    }

    @Builder
    public record DeleteSlotGroupCommand(UUID parkingId, SlotType slotType, String prefix, String zone) {}
}
