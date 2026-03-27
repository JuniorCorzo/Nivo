package dev.angelcorzo.nivo.model.payments.gateways;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.model.payments.valueobject.ProviderMetadata;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.model.transactions.Transactions;
import java.math.BigDecimal;
import java.util.Map;

public interface PaymentProviderGateway {
  Result<Transactions, PaymentError> getTransactionDetails(String checkoutSessionId);

  Result<ProviderMetadata, PaymentError> processPayment(
      ParkingTickets tickets, BigDecimal amount, CheckOut command);

  Result<Transactions, PaymentError> confirmationPay(Map<String, String> receipt);
}
