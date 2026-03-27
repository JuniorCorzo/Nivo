package dev.angelcorzo.nivo.paymentprovider.service;

import dev.angelcorzo.nivo.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.model.transactions.enums.TransactionStatus;
import dev.angelcorzo.nivo.model.transactions.gateways.TransactionsRepository;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PendingPaymentsReconciliationService {
  private final PaymentsRepository paymentsRepository;
  private final PaymentProviderGateway paymentProviderGateway;
  private final TransactionsRepository transactionsRepository;

  @Async
  @EventListener(value = ApplicationReadyEvent.class)
  public void reconcilePendingPayments() {
    log.info("Starting pending payments reconciliation");
    List<String> pendingPayments = this.paymentsRepository.findAllCheckoutSessionIds();
    log.info("Found {} pending payments to reconcile", pendingPayments.size());

    final List<CompletableFuture<Void>> futures =
        pendingPayments.stream()
            .map(
                checkoutId ->
                    CompletableFuture.runAsync(() -> this.reconcilePayment(checkoutId))
                        .exceptionally(
                            exception -> {
                              log.error(
                                  "Error reconciling payment with checkout session ID {}: {}",
                                  checkoutId,
                                  exception.getMessage(),
                                  exception);
                              return null;
                            }))
            .toList();

    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

    log.info("Finished pending payments reconciliation");
  }

  private void reconcilePayment(String reference) {
    try {
      this.paymentProviderGateway
          .getTransactionDetails(reference)
          .onSuccess(
              transaction -> {
                if (transaction.getStatus() == TransactionStatus.PENDING) {
                  return;
                }

                this.paymentsRepository
                    .findByCheckoutSessionId(reference)
                    .ifPresentOrElse(
                        payment -> {
                          log.info(
                              "Updating payment status for reference {}: {} -> {}",
                              reference,
                              payment.getStatus(),
                              transaction.getStatus().getPaymentStatus());

                          transaction.setPayment(payment);
                          this.paymentsRepository.processPayment(
                              payment.getId(), transaction.getStatus().getPaymentStatus());
                          this.transactionsRepository.save(transaction);
                        },
                        () -> log.warn("Payment not found for reference: {}", reference));
              })
          .onFailure(
              error ->
                  log.error(
                      "Error getting transaction details for reference {}: {}",
                      reference,
                      error.message()));
    } catch (Exception e) {
      log.error("Unexpected error reconciling payment {}: {}", reference, e.getMessage(), e);
    }
  }
}
