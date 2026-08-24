package dev.angelcorzo.nivo.api.slot.mappers;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.slot.dto.CreatedSlots;
import dev.angelcorzo.nivo.api.slot.dto.SlotResponse;
import dev.angelcorzo.nivo.api.slot.dto.SlotSummaryResponse;
import dev.angelcorzo.nivo.api.slot.dto.UpdateSlotRequest;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.valueobject.SlotSummary;
import dev.angelcorzo.nivo.usecase.editslot.EditSlotUseCase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapperStructConfig.class)
public interface SlotsMapper {
  EditSlotUseCase.UpdateSlotCommand toModel(UpdateSlotRequest dto);

  @Mapping(target = "currentNumberSlots", ignore = true)
  dev.angelcorzo.nivo.model.slots.valueobject.CreatedSlots toModel(CreatedSlots dto);

  SlotResponse toDto(Slots model);

  SlotSummaryResponse toDto(SlotSummary model);
}
