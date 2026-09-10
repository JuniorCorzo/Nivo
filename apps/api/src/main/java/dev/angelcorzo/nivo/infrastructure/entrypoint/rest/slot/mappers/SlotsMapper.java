package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.mappers;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.CreatedSlots;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.SlotResponse;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.SlotSummaryResponse;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.UpdateSlotRequest;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotSummary;
import dev.angelcorzo.nivo.domain.usecase.slot.EditSlotUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.UpdateSlotGroupUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.UpdateSlotMetadataUseCase;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.UpdateSlotGroupRequest;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.UpdateSlotMetadataRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapperStructConfig.class)
public interface SlotsMapper {
  EditSlotUseCase.UpdateSlotCommand toModel(UpdateSlotRequest dto);

  @Mapping(target = "currentNumberSlots", ignore = true)
  dev.angelcorzo.nivo.domain.model.slots.valueobject.CreatedSlots toModel(CreatedSlots dto);

  SlotResponse toDto(Slots model);

  SlotSummaryResponse toDto(SlotSummary model);

  UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand toCommand(UpdateSlotMetadataRequest request);

  UpdateSlotGroupUseCase.UpdateSlotGroupCommand toCommand(UpdateSlotGroupRequest request);
}
