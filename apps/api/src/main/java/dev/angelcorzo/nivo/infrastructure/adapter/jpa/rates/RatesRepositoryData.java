package dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RatesRepositoryData extends JpaRepository<RateData, UUID> {
  List<RateData> findAllByParking_Id(UUID id);
}
