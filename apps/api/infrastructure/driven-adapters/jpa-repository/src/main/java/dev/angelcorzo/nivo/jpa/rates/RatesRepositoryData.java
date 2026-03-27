package dev.angelcorzo.nivo.jpa.rates;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RatesRepositoryData extends JpaRepository<RateData, UUID> {
  List<RateData> findAllByParking_Id(UUID id);
}
