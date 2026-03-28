package dev.angelcorzo.nivo.jpa.rates.mapper;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.rates.RateData;
import dev.angelcorzo.nivo.model.rates.Rates;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface RatesMapper extends BaseMapper<Rates, RateData> {}
