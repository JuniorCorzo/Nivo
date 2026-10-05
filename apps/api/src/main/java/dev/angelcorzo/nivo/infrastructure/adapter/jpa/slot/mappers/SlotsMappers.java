package dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.CoordinatesMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.SlotsData;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class, uses = CoordinatesMapper.class)
public interface SlotsMappers extends BaseMapper<Slots, SlotsData> {}
