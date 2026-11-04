package dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates;

import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates.mapper.RatesMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

/**
 * Pure JPA repository adapter for {@link Rates}.
 */
@Repository("ratesRepositoryAdapter")
public class RatesRepositoryAdapter extends AdapterOperations<Rates, RateData, UUID, RatesRepositoryData>
  implements
    RatesRepository {

  public RatesRepositoryAdapter(final RatesRepositoryData repository, final RatesMapper mapper) {
    super(repository, mapper);
  }

  @Override
  public List<Rates> findAllByParkingLotId(final UUID parkingLotId) {
    return super.repository.findAllActiveByParkingId(parkingLotId)
      .stream()
      .map(super::toEntity)
      .toList();
  }

  @Override
  public Rates getReferenceById(final UUID uuid) {
    return super.toEntity(super.repository.getReferenceById(uuid));
  }

  @Override
  public Boolean existsById(final UUID uuid) {
    return super.repository.existsById(uuid);
  }

  @Override
  public void deleteById(final UUID uuid) {
    super.repository.deleteById(uuid);
  }

  @Override
  public boolean hasActiveTickets(final UUID rateId) {
    return super.repository.hasActiveTickets(rateId);
  }
}
