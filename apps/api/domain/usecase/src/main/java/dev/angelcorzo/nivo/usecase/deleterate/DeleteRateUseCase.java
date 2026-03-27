package dev.angelcorzo.nivo.usecase.deleterate;

import dev.angelcorzo.nivo.model.rates.gateways.RatesRepository;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class DeleteRateUseCase {
  private final RatesRepository ratesRepository;

  public void execute(UUID id) {
    this.ratesRepository.deleteById(id);
  }
}
