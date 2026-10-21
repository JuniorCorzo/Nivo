package dev.angelcorzo.nivo.domain.usecase.rate;

import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.model.rates.gateways.RatesRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ShowRatesByParkingLotUseCase {
  private final RatesRepository ratesRepository;

  public List<Rates> execute(UUID parkingLots) {
    return this.ratesRepository.findAllByParkingLotId(parkingLots);
  }
}
