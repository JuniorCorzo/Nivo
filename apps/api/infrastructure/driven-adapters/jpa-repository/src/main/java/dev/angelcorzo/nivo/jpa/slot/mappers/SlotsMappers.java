package dev.angelcorzo.nivo.jpa.slot.mappers;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.mappers.CoordinatesMapper;
import dev.angelcorzo.nivo.jpa.slot.SlotsData;
import dev.angelcorzo.nivo.model.slots.Slots;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class, uses = CoordinatesMapper.class)
public interface SlotsMappers extends BaseMapper<Slots, SlotsData> {}
