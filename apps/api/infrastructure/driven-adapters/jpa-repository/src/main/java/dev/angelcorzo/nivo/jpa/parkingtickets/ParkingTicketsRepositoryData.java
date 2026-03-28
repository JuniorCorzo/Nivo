package dev.angelcorzo.nivo.jpa.parkingtickets;

import dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ParkingTicketsRepositoryData extends JpaRepository<ParkingTicketsData, UUID> {

  Optional<ParkingTicketsData> findByTenant_IdAndId(UUID tenantId, UUID id);

  @Modifying
  @Query(
      "UPDATE ParkingTicketsData p SET  p.totalToCharge = ?2, p.exitTime = CURRENT_TIMESTAMP WHERE"
          + " p.id = ?1")
  void prepareCheckout(UUID ticketId, BigDecimal amountToCharge);

  @Modifying
  @Query("UPDATE ParkingTicketsData p SET p.status = ?2 WHERE p.id = ?1")
  void changeStatus(UUID ticketId, ParkingTicketStatus status);

  @Modifying
  @Query(
      value =
          "UPDATE ParkingTicketsData p SET p.status = 'CLOSED', p.closedAt = CURRENT_TIMESTAMP"
              + " WHERE p.id = ?1")
  void closeTicket(UUID ticketId);
}
