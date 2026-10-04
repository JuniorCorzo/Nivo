package dev.angelcorzo.nivo.usecase.deleterate;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.rates.Rates;
import dev.angelcorzo.nivo.model.rates.exceptions.RateNotFoundException;
import dev.angelcorzo.nivo.model.rates.gateways.RatesRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class DeleteRateUseCase {
  private final RatesRepository ratesRepository;
  private final AuthenticationContextGateway authenticationContext;

  public void execute(UUID id) {
    this.execute(id, this.authenticationContext.getCurrentTenantId());
  }

  public void execute(UUID id, UUID tenantId) {
    final Rates rate =
        this.ratesRepository
            .findById(id)
            .orElseThrow(() -> new RateNotFoundException(id));

    if (rate.getTenant() == null || !tenantId.equals(rate.getTenant().id())) {
      throw new RateNotFoundException(id);
    }

    this.ratesRepository.deleteById(id);
  }
}
