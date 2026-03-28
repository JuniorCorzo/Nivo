package dev.angelcorzo.nivo.api.slot.mappers;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.slot.dto.CreateSlotRequest;
import dev.angelcorzo.nivo.api.slot.dto.SlotResponse;
import dev.angelcorzo.nivo.api.slot.dto.UpdateSlotRequest;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.usecase.createslot.CreateSlotUseCase;
import dev.angelcorzo.nivo.usecase.editslot.EditSlotUseCase;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface SlotsMapper {
  EditSlotUseCase.UpdateSlotCommand toModel(UpdateSlotRequest dto);

  CreateSlotUseCase.CreateSlotCommand toModel(CreateSlotRequest dto);

  SlotResponse toDto(Slots model);
}
