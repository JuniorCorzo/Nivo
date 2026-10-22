package dev.angelcorzo.nivo.infrastructure.adapter.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.commons.result.Result;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.domain.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.ProviderMetadata;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.check_out.EmailCheckOut;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.check_out.NoSendCheckOut;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.check_out.SMSCheckOut;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.model.transactions.Transactions;
import dev.angelcorzo.nivo.infrastructure.adapter.payment.client.PaymentProviderClient;
import dev.angelcorzo.nivo.infrastructure.adapter.payment.config.PaymentProviderProperties;
import dev.angelcorzo.nivo.infrastructure.adapter.payment.dtos.response.CreatePayLinkResponse;
import dev.angelcorzo.nivo.infrastructure.adapter.payment.dtos.response.ListPayLinkResponse;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("EpaycoPaymentAdapter Unit Tests")
class EpaycoPaymentAdapterTest {

  @Mock private PaymentProviderClient paymentProviderClient;

  private PaymentProviderProperties properties;
  private EpaycoPaymentAdapter adapter;

  @BeforeEach
  void setUp() {
    properties = new PaymentProviderProperties();
    properties.setProviderName("epayco");
    properties.setPublicKey("test_pub_key");
    properties.setConfirmationUrl("http://localhost:8080/api/payments/confirm");
    properties.setConfirmationMethod("POST");

    adapter = new EpaycoPaymentAdapter(paymentProviderClient, properties);
  }

  @Test
  @DisplayName("getTransactionDetails should return Transactions on success")
  void shouldReturnTransactionDetailsOnSuccess() {
    ListPayLinkResponse payLinkDetails =
        new ListPayLinkResponse(
            123L,
            "txtCode",
            "2026-03-01",
            "title",
            "ref-001",
            "COP",
            BigDecimal.valueOf(5000),
            1,
            ListPayLinkResponse.State.PAID,
            1L,
            "routeLink");

    when(paymentProviderClient.getPayLinkDetails("session-1"))
        .thenReturn(Result.success(payLinkDetails));

    Result<Transactions, PaymentError> result = adapter.getTransactionDetails("session-1");

    assertThat(result.isSuccess()).isTrue();
    Transactions tx = result.get();
    assertThat(tx.getSupplierRef()).isEqualTo("ref-001");
    assertThat(tx.getTransactionId()).isEqualTo("123");
    assertThat(tx.getPaymentProvider()).isEqualTo("epayco");
  }

  @Test
  @DisplayName("processPayment should succeed with EmailCheckOut")
  void shouldProcessPaymentWithEmailCheckOut() {
    ParkingTickets ticket =
        ParkingTickets.builder()
            .rate(RateReference.builder().name("AUTO").description("desc").build())
            .build();
    EmailCheckOut checkOut =
        new EmailCheckOut(
            UUID.randomUUID(), UUID.randomUUID(), PaymentsMethods.PAY_LINK, "user@example.com");

    CreatePayLinkResponse response =
        new CreatePayLinkResponse(
            1L, "title", "desc", "2026-03-01 12:00:00", 1, "txt", 1L, 1, 1, 0, "COP",
            "sell", "url", "url", 0, 0, 5000, "inv", "qr", "https://checkout.epayco.co/123",
            "2026-03-01 13:00:00");

    when(paymentProviderClient.createPayLink(any())).thenReturn(Result.success(response));

    Result<ProviderMetadata, PaymentError> result =
        adapter.processPayment(ticket, BigDecimal.valueOf(5000), checkOut);

    assertThat(result.isSuccess()).isTrue();
    assertThat(result.get().checkoutUrl()).isEqualTo("https://checkout.epayco.co/123");
  }

  @Test
  @DisplayName("processPayment should succeed with SMSCheckOut")
  void shouldProcessPaymentWithSMSCheckOut() {
    ParkingTickets ticket =
        ParkingTickets.builder()
            .rate(RateReference.builder().name("AUTO").description("desc").build())
            .build();
    SMSCheckOut checkOut =
        new SMSCheckOut(
            UUID.randomUUID(), UUID.randomUUID(), PaymentsMethods.PAY_LINK, "3001234567");

    CreatePayLinkResponse response =
        new CreatePayLinkResponse(
            1L, "title", "desc", "2026-03-01 12:00:00", 1, "txt", 1L, 1, 1, 0, "COP",
            "sell", "url", "url", 0, 0, 5000, "inv", "qr", "https://checkout.epayco.co/456",
            "2026-03-01 13:00:00");

    when(paymentProviderClient.createPayLink(any())).thenReturn(Result.success(response));

    Result<ProviderMetadata, PaymentError> result =
        adapter.processPayment(ticket, BigDecimal.valueOf(5000), checkOut);

    assertThat(result.isSuccess()).isTrue();
    assertThat(result.get().checkoutUrl()).isEqualTo("https://checkout.epayco.co/456");
  }

  @Test
  @DisplayName("processPayment should succeed with NoSendCheckOut")
  void shouldProcessPaymentWithNoSendCheckOut() {
    ParkingTickets ticket =
        ParkingTickets.builder()
            .rate(RateReference.builder().name("AUTO").description("desc").build())
            .build();
    NoSendCheckOut checkOut =
        new NoSendCheckOut(
            UUID.randomUUID(), UUID.randomUUID(), PaymentsMethods.PAY_LINK);

    CreatePayLinkResponse response =
        new CreatePayLinkResponse(
            1L, "title", "desc", "2026-03-01 12:00:00", 1, "txt", 1L, 1, 1, 0, "COP",
            "sell", "url", "url", 0, 0, 5000, "inv", "qr", "https://checkout.epayco.co/789",
            "2026-03-01 13:00:00");

    when(paymentProviderClient.createPayLink(any())).thenReturn(Result.success(response));

    Result<ProviderMetadata, PaymentError> result =
        adapter.processPayment(ticket, BigDecimal.valueOf(5000), checkOut);

    assertThat(result.isSuccess()).isTrue();
    assertThat(result.get().checkoutUrl()).isEqualTo("https://checkout.epayco.co/789");
  }
}
