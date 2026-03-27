package dev.angelcorzo.nivo.model.payments.gateways;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentsRepository {
  Optional<Payments> findById(UUID id);

  Optional<Payments> findByCheckoutSessionId(String checkoutSessionId);

  Optional<Payments> findByParkingTicketId(UUID parkingTicketId);

  List<String> findAllCheckoutSessionIds();

  boolean existsByParkingTicketId(UUID parkingTicketId);

  Payments getReferenceById(UUID id);

  Result<Payments, PaymentError> processPayment(Payments payment);

  Result<Payments, PaymentError> processPayment(UUID paymentId, PaymentStatus newStatus);
}
