package dev.angelcorzo.nivo.infrastructure.adapter.payment;

import dev.angelcorzo.nivo.domain.model.commons.result.Result;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.domain.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.ProviderMetadata;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.domain.model.transactions.Transactions;
import java.math.BigDecimal;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DisabledPaymentAdapter implements PaymentProviderGateway {

  private static final String DISABLED_MESSAGE = "Online payment provider is disabled in this environment";

  @Override
  public Result<Transactions, PaymentError> getTransactionDetails(String checkoutSessionId) {
    log.warn(
      "Payment module is disabled. Cannot get transaction details for checkoutSessionId: {}",
      checkoutSessionId);
    return Result.failure(new PaymentError.ProviderValidation(DISABLED_MESSAGE));
  }

  @Override
  public Result<ProviderMetadata, PaymentError> processPayment(
    ParkingTickets tickets, BigDecimal amount, CheckOut command) {
    log.warn(
      "Payment module is disabled. Cannot process payment for ticket: {}",
      tickets != null ? tickets.getId() : null);
    return Result.failure(new PaymentError.ProviderValidation(DISABLED_MESSAGE));
  }

  @Override
  public Result<Transactions, PaymentError> confirmationPay(Map<String, String> receipt) {
    log.warn("Payment module is disabled. Cannot process confirmation pay");
    return Result.failure(new PaymentError.ProviderValidation(DISABLED_MESSAGE));
  }
}
