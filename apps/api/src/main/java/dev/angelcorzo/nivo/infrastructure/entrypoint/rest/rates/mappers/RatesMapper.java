package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.mappers;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto.CreateRate;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto.RatesDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto.UpdateRate;
import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.usecase.rate.RateConfigurationUseCase;
import dev.angelcorzo.nivo.domain.usecase.rate.UpdateRateUseCase;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface RatesMapper {
  RateConfigurationUseCase.CreateTariff toModel(CreateRate dto);
  UpdateRateUseCase.UpdateRate toModel(UpdateRate dto);

  RatesDTO toDTO(Rates model);
}
