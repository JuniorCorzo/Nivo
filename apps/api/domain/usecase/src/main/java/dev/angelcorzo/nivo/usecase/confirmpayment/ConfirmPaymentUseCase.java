package dev.angelcorzo.nivo.usecase.confirmpayment;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.payments.exceptions.ConfirmPaymentException;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentNotFound;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.model.payments.observer.PaymentEvent;
import dev.angelcorzo.nivo.model.payments.observer.PaymentEventBroker;
import dev.angelcorzo.nivo.model.transactions.Transactions;
import dev.angelcorzo.nivo.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.nivo.usecase.notifications.PaymentNotifier;
import java.util.Map;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ConfirmPaymentUseCase {
  private final PaymentsRepository paymentsRepository;
  private final TransactionsRepository transactionsRepository;
  private final PaymentProviderGateway paymentProviderGateway;
  private final PaymentEventBroker paymentEventBroker;
  private final ParkingTicketsRepository parkingTicketsRepository;
  private final PaymentNotifier paymentNotifier;

  public Payments execute(Map<String, String> receipt, String transactionId) {
    return this.paymentsRepository
        .findByCheckoutSessionId(transactionId)
        .map(payment -> this.processConfirmation(receipt, payment))
        .orElseThrow(() -> new PaymentNotFound(transactionId));
  }

  private Payments processConfirmation(Map<String, String> receipt, Payments payment) {
    if (payment.getStatus() != PaymentStatus.PENDING_CHECKOUT) {
      return payment;
    }

    return this.paymentProviderGateway
        .confirmationPay(receipt)
        .flatMap(transaction -> this.validateAndAssociate(payment, transaction))
        .flatMap(this::saveTransaction)
        .flatMap(transaction -> this.finalizePayment(transaction, payment))
        .onSuccess(this::closeTicket)
        .onSuccess(this::notify)
        .orElseThrow(ConfirmPaymentException::new);
  }

  private Result<Transactions, PaymentError> validateAndAssociate(
      Payments payment, Transactions transaction) {
    return validateTransaction(payment, transaction).onSuccess(t -> t.setPayment(payment));
  }

  private Result<Transactions, PaymentError> validateTransaction(
      Payments payment, Transactions transaction) {
    if (this.transactionsRepository.existsBySupplierRef(transaction.getSupplierRef())) {
      return Result.failure(new PaymentError.ProviderValidation("La transacción ya existe", 200));
    }

    boolean matchesSession = payment.getCheckoutSessionId().equals(transaction.getSupplierRef());
    boolean matchesExternal = payment.getExternalPaymentId().equals(transaction.getTransactionId());

    if (!matchesSession && !matchesExternal) {
      return Result.failure(new PaymentError.ProviderValidation("Referencia de pago no coincide"));
    }

    if (payment.getAmount().compareTo(transaction.getAmount()) != 0) {
      return Result.failure(new PaymentError.InvalidAmount(transaction.getAmount()));
    }

    return Result.success(transaction);
  }

  private Result<Transactions, PaymentError> saveTransaction(Transactions transaction) {
    try {
      return Result.success(this.transactionsRepository.save(transaction));
    } catch (Exception ex) {
      return Result.failure(
          new PaymentError.DatabaseError(
              String.format("Failed to create transaction: %s", ex.getMessage())));
    }
  }

  private Result<Payments, PaymentError> finalizePayment(
      Transactions transaction, Payments payment) {
    payment.setStatus(transaction.getStatus().getPaymentStatus());
    return this.paymentsRepository.processPayment(payment);
  }

  private void notify(Payments currentPayment) {
    final PaymentEvent event = PaymentEvent.of(currentPayment.getId(), currentPayment.getStatus());
    this.paymentEventBroker.notifyObservers(currentPayment.getId().toString(), event);
    this.paymentNotifier.notifyPaymentCompleted(currentPayment);
  }

  private void closeTicket(Payments currentPayment) {
    try {
      this.parkingTicketsRepository.closeTicket(currentPayment.getParkingTicket().getId());
    } catch (Exception ex) {
      throw new ConfirmPaymentException(
          new PaymentError.DatabaseError(
              String.format(
                  "Failed to close ticket %s: %s",
                  currentPayment.getParkingTicket().getId(), ex.getMessage())));
    }
  }
}
