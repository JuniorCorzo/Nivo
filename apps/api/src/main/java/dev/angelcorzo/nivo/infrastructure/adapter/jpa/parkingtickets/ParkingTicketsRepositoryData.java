package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets;

import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ParkingTicketsRepositoryData extends JpaRepository<ParkingTicketsData, UUID> {

  Optional<ParkingTicketsData> findByTenant_IdAndId(UUID tenantId, UUID id);

  @Modifying
  @Query(
      value =
          "UPDATE nivo.parking_tickets SET total_to_charge = ?2, exit_time = CURRENT_TIMESTAMP WHERE id = ?1",
      nativeQuery = true)
  void prepareCheckout(UUID ticketId, BigDecimal amountToCharge);

  @Modifying
  @Query("UPDATE ParkingTicketsData p SET p.status = ?2 WHERE p.id = ?1")
  void changeStatus(UUID ticketId, ParkingTicketStatus status);

  @Modifying
  @Query(
      value =
          "UPDATE nivo.parking_tickets SET status = 'CLOSED', closed_at = CURRENT_TIMESTAMP WHERE id = ?1",
      nativeQuery = true)
  void closeTicket(UUID ticketId);

  List<ParkingTicketsData> findAllBySlot_Parking_Id(UUID parkingLotId);

  @Query("SELECT p FROM ParkingTicketsData p WHERE p.slot.id = ?1 AND p.status = dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus.OPEN")
  Optional<ParkingTicketsData> findActiveBySlotId(UUID slotId);
}
