package dev.angelcorzo.nivo.model.rates.gateways;

import dev.angelcorzo.nivo.model.rates.Rates;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RatesRepository {
  List<Rates> findAll();

  Optional<Rates> findById(UUID id);

  List<Rates> findAllByParkingLotId(UUID parkingLotId);

  Rates getReferenceById(UUID uuid);

  Boolean existsById(UUID uuid);

  Rates save(Rates rate);

  void deleteById(UUID uuid);
}
