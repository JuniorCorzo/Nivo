package dev.angelcorzo.nivo.jpa.slot;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SlotsRepositoryData extends JpaRepository<SlotsData, UUID> {
  List<SlotsData> findAllByParking_Id(UUID parkingLotId);
}
