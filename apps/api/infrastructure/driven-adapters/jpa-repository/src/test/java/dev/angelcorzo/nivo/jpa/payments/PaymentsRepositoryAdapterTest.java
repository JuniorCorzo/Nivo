package dev.angelcorzo.nivo.jpa.payments;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.payments.mapper.PaymentMapper;
import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

@DisplayName("PaymentsRepositoryAdapter Unit Tests")
class PaymentsRepositoryAdapterTest {

  private PaymentsRepositoryData repository;
  private PaymentMapper mapper;
  private PaymentsRepositoryAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(PaymentsRepositoryData.class);
    mapper = mock(PaymentMapper.class);
    adapter = new PaymentsRepositoryAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find payment by checkout session ID")
  void shouldFindByCheckoutSessionId() {
    String sessionId = "cs_test_123";
    PaymentsData data = new PaymentsData();
    Payments payment = Payments.builder().id(UUID.randomUUID()).build();

    when(repository.findByCheckoutSessionId(sessionId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(payment);

    Optional<Payments> result = adapter.findByCheckoutSessionId(sessionId);

    assertThat(result).isPresent();
    assertThat(result.get()).isEqualTo(payment);
  }

  @Test
  @DisplayName("Should find all checkout session IDs")
  void shouldFindAllCheckoutSessionIds() {
    List<String> sessionIds = List.of("cs_1", "cs_2");
    when(repository.findAllCheckoutSessionIds()).thenReturn(sessionIds);

    List<String> result = adapter.findAllCheckoutSessionIds();

    assertThat(result).containsExactly("cs_1", "cs_2");
  }

  @Test
  @DisplayName("Should check existence by parking ticket ID")
  void shouldCheckExistsByParkingTicketId() {
    UUID ticketId = UUID.randomUUID();
    when(repository.existsByParkingTicketId(ticketId)).thenReturn(true);

    assertThat(adapter.existsByParkingTicketId(ticketId)).isTrue();
  }

  @Test
  @DisplayName("Should process payment successfully")
  void shouldProcessPaymentSuccessfully() {
    UUID ticketId = UUID.randomUUID();
    ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
    Payments payment = Payments.builder().id(UUID.randomUUID()).parkingTicket(ticket).build();
    PaymentsData data = new PaymentsData();

    when(mapper.toData(payment)).thenReturn(data);
    when(repository.saveAndFlush(data)).thenReturn(data);
    when(mapper.toEntity(data)).thenReturn(payment);

    Result<Payments, PaymentError> result = adapter.processPayment(payment);

    assertThat(result.isSuccess()).isTrue();
    assertThat(result.get()).isEqualTo(payment);
  }

  @Test
  @DisplayName("Should return duplicate error when DataIntegrityViolationException is thrown")
  void shouldReturnDuplicateErrorOnConstraintViolation() {
    UUID ticketId = UUID.randomUUID();
    ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
    Payments payment = Payments.builder().id(UUID.randomUUID()).parkingTicket(ticket).build();
    PaymentsData data = new PaymentsData();

    when(mapper.toData(payment)).thenReturn(data);
    when(repository.saveAndFlush(data)).thenThrow(new DataIntegrityViolationException("duplicate key"));

    Result<Payments, PaymentError> result = adapter.processPayment(payment);

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.Duplicate.class);
  }

  @Test
  @DisplayName("Should process payment status update successfully")
  void shouldProcessPaymentStatusUpdate() {
    UUID paymentId = UUID.randomUUID();
    PaymentsData data = new PaymentsData();
    Payments payment = Payments.builder().id(paymentId).status(PaymentStatus.PAID).build();

    when(repository.findById(paymentId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(payment);

    Result<Payments, PaymentError> result = adapter.processPayment(paymentId, PaymentStatus.PAID);

    assertThat(result.isSuccess()).isTrue();
    assertThat(result.get().getStatus()).isEqualTo(PaymentStatus.PAID);
    verify(repository).processPayment(paymentId, PaymentStatus.PAID);
  }
}
