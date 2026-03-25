package dev.angelcorzo.neoparking.jpa.payments;

import dev.angelcorzo.neoparking.model.payments.enums.PaymentStatus;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

public interface PaymentsRepositoryData extends JpaRepository<PaymentsData, UUID> {

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @QueryHints({@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")})
  @Query(value = "SELECT p FROM PaymentsData p WHERE  p.checkoutSessionId = :checkoutSessionId")
  Optional<PaymentsData> findByCheckoutSessionId(
      @Param("checkoutSessionId") String checkoutSessionId);

  @Query(
      value =
          """
          SELECT p FROM PaymentsData p
          WHERE p.parkingTicket.id = :parkingTicketId
          AND p.status IN ('PENDING_PAYMENT', 'PENDING_CHECKOUT')
          """)
  Optional<PaymentsData> findByParkingTicketId(@Param("parkingTicketId") UUID parkingTicketId);

  @Query(
      value =
          """
            SELECT p.checkoutSessionId FROM PaymentsData p
            WHERE p.checkoutSessionId IS NOT NULL
            AND p.status IN ('PENDING_PAYMENT', 'PENDING_CHECKOUT')
          """)
  List<String> findAllCheckoutSessionIds();

  boolean existsByParkingTicketId(UUID parkingTicketId);

  @Modifying
  @Query(
      value =
          """
          UPDATE PaymentsData p
          SET p.status = :newStatus
          WHERE p.id = :paymentId
          """)
  void processPayment(
      @Param("paymentId") UUID paymentId, @Param("newStatus") PaymentStatus newStatus);
}