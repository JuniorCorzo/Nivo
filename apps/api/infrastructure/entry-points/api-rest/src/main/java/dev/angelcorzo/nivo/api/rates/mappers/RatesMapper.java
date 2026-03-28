package dev.angelcorzo.nivo.api.rates.mappers;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.rates.dto.CreateRate;
import dev.angelcorzo.nivo.api.rates.dto.RatesDTO;
import dev.angelcorzo.nivo.api.rates.dto.UpdateRate;
import dev.angelcorzo.nivo.model.rates.Rates;
import dev.angelcorzo.nivo.usecase.rateconfiguration.RateConfigurationUseCase;
import dev.angelcorzo.nivo.usecase.updaterate.UpdateRateUseCase;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface RatesMapper {
  RateConfigurationUseCase.CreateTariff toModel(CreateRate dto);
  UpdateRateUseCase.UpdateRate toModel(UpdateRate dto);

  RatesDTO toDTO(Rates model);
}
