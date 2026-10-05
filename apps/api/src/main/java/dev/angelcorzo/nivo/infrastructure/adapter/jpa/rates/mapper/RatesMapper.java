package dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates.mapper;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.CoordinatesMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates.RateData;
import dev.angelcorzo.nivo.domain.model.rates.Rates;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class, uses = CoordinatesMapper.class)
public interface RatesMapper extends BaseMapper<Rates, RateData> {}
