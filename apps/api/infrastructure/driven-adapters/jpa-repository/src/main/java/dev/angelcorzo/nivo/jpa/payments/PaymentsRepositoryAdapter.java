package dev.angelcorzo.nivo.jpa.payments;

import dev.angelcorzo.nivo.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.jpa.payments.mapper.PaymentMapper;
import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentNotFound;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Slf4j
public class PaymentsRepositoryAdapter
    extends AdapterOperations<Payments, PaymentsData, UUID, PaymentsRepositoryData>
    implements PaymentsRepository {

  protected PaymentsRepositoryAdapter(PaymentsRepositoryData repository, PaymentMapper mapper) {
    super(repository, mapper);
  }

  @Override
  @Transactional
  public Optional<Payments> findByCheckoutSessionId(String transactionId) {
    return super.repository.findByCheckoutSessionId(transactionId).map(super::toEntity);
  }

  @Override
  public List<String> findAllCheckoutSessionIds() {
    return super.repository.findAllCheckoutSessionIds();
  }

  @Override
  @Transactional(readOnly = true)
  public Payments getReferenceById(UUID id) {
    return super.mapper.toEntity(super.repository.getReferenceById(id));
  }

  @Override
  public boolean existsByParkingTicketId(UUID parkingTicketId) {
    return super.repository.existsByParkingTicketId(parkingTicketId);
  }

  @Override
  public Optional<Payments> findByParkingTicketId(UUID parkingTicketId) {
    return super.repository.findByParkingTicketId(parkingTicketId).map(super::toEntity);
  }

  @Override
  @Transactional
  public Result<Payments, PaymentError> processPayment(Payments entity) {
    try {
      final Payments payment = super.save(entity);
      return Result.success(payment);
    } catch (DataIntegrityViolationException exception) {
      log.error("Payment duplicate: {}", exception.getMessage());
      return Result.failure(new PaymentError.Duplicate(entity.getParkingTicket().getId()));
    } catch (Exception e) {
      log.error("Error saving payment: {}", e.getMessage());
      return Result.failure(new PaymentError.DatabaseError(e.getMessage()));
    }
  }

  @Override
  @Transactional
  public Result<Payments, PaymentError> processPayment(UUID paymentId, PaymentStatus newStatus) {
    try {
      super.repository.processPayment(paymentId, newStatus);

      return Result.success(
          super.findById(paymentId).orElseThrow(() -> new PaymentNotFound(paymentId.toString())));
    } catch (Exception e) {
      log.error("Error processing payment with ID {}: {}", paymentId, e.getMessage());
      return Result.failure(new PaymentError.DatabaseError(e.getMessage()));
    }
  }
}
