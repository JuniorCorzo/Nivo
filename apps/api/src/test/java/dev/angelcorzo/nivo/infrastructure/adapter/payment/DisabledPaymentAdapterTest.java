package dev.angelcorzo.nivo.infrastructure.adapter.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import dev.angelcorzo.nivo.domain.model.commons.result.Result;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.domain.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.ProviderMetadata;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.check_out.NoSendCheckOut;
import dev.angelcorzo.nivo.domain.model.transactions.Transactions;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DisabledPaymentAdapter Unit Tests")
class DisabledPaymentAdapterTest {

  private DisabledPaymentAdapter adapter;

  @BeforeEach
  void setUp() {
    adapter = new DisabledPaymentAdapter();
  }

  @Test
  @DisplayName("getTransactionDetails should return failure with ProviderValidation when disabled")
  void shouldFailGetTransactionDetailsWhenDisabled() {
    Result<Transactions, PaymentError> result = adapter.getTransactionDetails("session-123");

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderValidation.class);
    assertThat(result.getError().message())
        .isEqualTo("Payment module is disabled in this environment");
  }

  @Test
  @DisplayName("processPayment should return failure with ProviderValidation when disabled")
  void shouldFailProcessPaymentWhenDisabled() {
    ParkingTickets tickets = mock(ParkingTickets.class);
    CheckOut checkOut =
        new NoSendCheckOut(UUID.randomUUID(), UUID.randomUUID(), PaymentsMethods.PAY_LINK);

    Result<ProviderMetadata, PaymentError> result =
        adapter.processPayment(tickets, BigDecimal.valueOf(10000), checkOut);

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderValidation.class);
    assertThat(result.getError().message())
        .isEqualTo("Payment module is disabled in this environment");
  }

  @Test
  @DisplayName("confirmationPay should return failure with ProviderValidation when disabled")
  void shouldFailConfirmationPayWhenDisabled() {
    Result<Transactions, PaymentError> result =
        adapter.confirmationPay(Map.of("ref_payco", "12345"));

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderValidation.class);
    assertThat(result.getError().message())
        .isEqualTo("Payment module is disabled in this environment");
  }
}
