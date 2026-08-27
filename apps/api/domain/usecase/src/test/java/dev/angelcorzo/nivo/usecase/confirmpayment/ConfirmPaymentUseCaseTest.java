package dev.angelcorzo.nivo.usecase.confirmpayment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.payments.exceptions.ConfirmPaymentException;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentNotFound;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.model.payments.observer.PaymentEventBroker;
import dev.angelcorzo.nivo.model.transactions.Transactions;
import dev.angelcorzo.nivo.model.transactions.enums.TransactionStatus;
import dev.angelcorzo.nivo.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.nivo.usecase.notifications.PaymentNotifier;
import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("ConfirmPaymentUseCase Tests")
class ConfirmPaymentUseCaseTest {

  private PaymentsRepository paymentsRepository;
  private TransactionsRepository transactionsRepository;
  private PaymentProviderGateway paymentProviderGateway;
  private PaymentEventBroker paymentEventBroker;
  private ParkingTicketsRepository parkingTicketsRepository;
  private PaymentNotifier paymentNotifier;
  private ConfirmPaymentUseCase useCase;

  @BeforeEach
  void setUp() {
    paymentsRepository = mock(PaymentsRepository.class);
    transactionsRepository = mock(TransactionsRepository.class);
    paymentProviderGateway = mock(PaymentProviderGateway.class);
    paymentEventBroker = mock(PaymentEventBroker.class);
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    paymentNotifier = mock(PaymentNotifier.class);

    useCase =
        new ConfirmPaymentUseCase(
            paymentsRepository,
            transactionsRepository,
            paymentProviderGateway,
            paymentEventBroker,
            parkingTicketsRepository,
            paymentNotifier);
  }

  @Nested
  @DisplayName("Happy Path")
  class HappyPath {

    @Test
    @DisplayName("Should successfully confirm payment, save transaction, close ticket and notify")
    void shouldConfirmPaymentSuccessfully() {
      // Arrange
      String sessionId = "session-12345";
      UUID paymentId = UUID.randomUUID();
      UUID ticketId = UUID.randomUUID();
      BigDecimal amount = BigDecimal.valueOf(18000);

      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      Payments pendingPayment =
          Payments.builder()
              .id(paymentId)
              .parkingTicket(ticket)
              .amount(amount)
              .status(PaymentStatus.PENDING_CHECKOUT)
              .checkoutSessionId(sessionId)
              .externalPaymentId("ext-999")
              .build();

      Transactions transaction =
          Transactions.builder()
              .supplierRef(sessionId)
              .transactionId("ext-999")
              .amount(amount)
              .status(TransactionStatus.APPROVED)
              .build();

      Map<String, String> receipt = Map.of("x_ref_payco", "12345");

      when(paymentsRepository.findByCheckoutSessionId(sessionId))
          .thenReturn(Optional.of(pendingPayment));
      when(paymentProviderGateway.confirmationPay(receipt))
          .thenReturn(Result.success(transaction));
      when(transactionsRepository.existsBySupplierRef(sessionId)).thenReturn(false);
      when(transactionsRepository.save(any(Transactions.class))).thenReturn(transaction);
      when(paymentsRepository.processPayment(any(Payments.class)))
          .thenReturn(Result.success(pendingPayment));

      // Act
      Payments result = useCase.execute(receipt, sessionId);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getStatus()).isEqualTo(PaymentStatus.PAID);

      verify(transactionsRepository).save(transaction);
      verify(parkingTicketsRepository).closeTicket(ticketId);
      verify(paymentEventBroker).notifyObservers(eq(paymentId.toString()), any());
      verify(paymentNotifier).notifyPaymentCompleted(pendingPayment);
    }

    @Test
    @DisplayName("Should return payment directly when status is not PENDING_CHECKOUT (idempotency)")
    void shouldReturnDirectlyWhenNotPendingCheckout() {
      // Arrange
      String sessionId = "session-already-approved";
      Payments alreadyPaid =
          Payments.builder()
              .id(UUID.randomUUID())
              .status(PaymentStatus.PAID)
              .checkoutSessionId(sessionId)
              .build();

      when(paymentsRepository.findByCheckoutSessionId(sessionId))
          .thenReturn(Optional.of(alreadyPaid));

      // Act
      Payments result = useCase.execute(Map.of(), sessionId);

      // Assert
      assertThat(result).isEqualTo(alreadyPaid);
      verify(paymentProviderGateway, never()).confirmationPay(any());
      verify(transactionsRepository, never()).save(any());
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ErrorCases {

    @Test
    @DisplayName("Should throw PaymentNotFound when session ID does not match any payment")
    void shouldThrowWhenPaymentNotFound() {
      String sessionId = "unknown-session";
      when(paymentsRepository.findByCheckoutSessionId(sessionId)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> useCase.execute(Map.of(), sessionId))
          .isInstanceOf(PaymentNotFound.class);
    }

    @Test
    @DisplayName("Should throw ConfirmPaymentException when provider confirmation fails")
    void shouldThrowWhenProviderConfirmationFails() {
      String sessionId = "session-123";
      Payments pending =
          Payments.builder()
              .status(PaymentStatus.PENDING_CHECKOUT)
              .checkoutSessionId(sessionId)
              .build();

      when(paymentsRepository.findByCheckoutSessionId(sessionId)).thenReturn(Optional.of(pending));
      when(paymentProviderGateway.confirmationPay(any()))
          .thenReturn(Result.failure(new PaymentError.ProviderValidation("Invalid signature")));

      assertThatThrownBy(() -> useCase.execute(Map.of(), sessionId))
          .isInstanceOf(ConfirmPaymentException.class);
    }

    @Test
    @DisplayName("Should throw ConfirmPaymentException when transaction already exists (duplicate)")
    void shouldThrowWhenTransactionDuplicate() {
      String sessionId = "session-123";
      Payments pending =
          Payments.builder()
              .status(PaymentStatus.PENDING_CHECKOUT)
              .checkoutSessionId(sessionId)
              .externalPaymentId("ext-123")
              .amount(BigDecimal.TEN)
              .build();

      Transactions transaction =
          Transactions.builder()
              .supplierRef(sessionId)
              .transactionId("ext-123")
              .amount(BigDecimal.TEN)
              .build();

      when(paymentsRepository.findByCheckoutSessionId(sessionId)).thenReturn(Optional.of(pending));
      when(paymentProviderGateway.confirmationPay(any())).thenReturn(Result.success(transaction));
      when(transactionsRepository.existsBySupplierRef(sessionId)).thenReturn(true);

      assertThatThrownBy(() -> useCase.execute(Map.of(), sessionId))
          .isInstanceOf(ConfirmPaymentException.class);
    }

    @Test
    @DisplayName("Should throw ConfirmPaymentException when amount does not match")
    void shouldThrowWhenAmountDoesNotMatch() {
      String sessionId = "session-123";
      Payments pending =
          Payments.builder()
              .status(PaymentStatus.PENDING_CHECKOUT)
              .checkoutSessionId(sessionId)
              .externalPaymentId("ext-123")
              .amount(BigDecimal.valueOf(50000))
              .build();

      Transactions transaction =
          Transactions.builder()
              .supplierRef(sessionId)
              .transactionId("ext-123")
              .amount(BigDecimal.valueOf(10000)) // mismatched amount
              .build();

      when(paymentsRepository.findByCheckoutSessionId(sessionId)).thenReturn(Optional.of(pending));
      when(paymentProviderGateway.confirmationPay(any())).thenReturn(Result.success(transaction));
      when(transactionsRepository.existsBySupplierRef(sessionId)).thenReturn(false);

      assertThatThrownBy(() -> useCase.execute(Map.of(), sessionId))
          .isInstanceOf(ConfirmPaymentException.class);
    }

    @Test
    @DisplayName("Should throw ConfirmPaymentException when ticket close fails")
    void shouldThrowWhenTicketCloseFails() {
      String sessionId = "session-123";
      UUID ticketId = UUID.randomUUID();
      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      Payments pending =
          Payments.builder()
              .id(UUID.randomUUID())
              .parkingTicket(ticket)
              .status(PaymentStatus.PENDING_CHECKOUT)
              .checkoutSessionId(sessionId)
              .externalPaymentId("ext-123")
              .amount(BigDecimal.TEN)
              .build();

      Transactions transaction =
          Transactions.builder()
              .supplierRef(sessionId)
              .transactionId("ext-123")
              .amount(BigDecimal.TEN)
              .status(TransactionStatus.APPROVED)
              .build();

      when(paymentsRepository.findByCheckoutSessionId(sessionId)).thenReturn(Optional.of(pending));
      when(paymentProviderGateway.confirmationPay(any())).thenReturn(Result.success(transaction));
      when(transactionsRepository.existsBySupplierRef(sessionId)).thenReturn(false);
      when(transactionsRepository.save(any())).thenReturn(transaction);
      when(paymentsRepository.processPayment(any())).thenReturn(Result.success(pending));
      doThrow(new RuntimeException("DB locked on close")).when(parkingTicketsRepository).closeTicket(ticketId);

      assertThatThrownBy(() -> useCase.execute(Map.of(), sessionId))
          .isInstanceOf(ConfirmPaymentException.class);
    }
  }
}
