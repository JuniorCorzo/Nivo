package dev.angelcorzo.nivo.jpa.transactions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.payments.PaymentsData;
import dev.angelcorzo.nivo.jpa.transactions.mappers.TransactionMapper;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.transactions.Transactions;
import dev.angelcorzo.nivo.model.transactions.enums.TransactionStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("TransactionRepositoryAdapter Unit Tests")
class TransactionRepositoryAdapterTest {

  private TransactionRepositoryData repository;
  private TransactionMapper mapper;
  private TransactionRepositoryAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(TransactionRepositoryData.class);
    mapper = mock(TransactionMapper.class);
    adapter = new TransactionRepositoryAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find transaction by supplier reference")
  void shouldFindBySupplierRef() {
    String ref = "TX-9999";
    TransactionsData data = new TransactionsData();
    Transactions entity = Transactions.builder().id(UUID.randomUUID()).supplierRef(ref).build();

    when(repository.findBySupplierRef(ref)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    Optional<Transactions> result = adapter.findBySupplierRef(ref);

    assertThat(result).isPresent();
    assertThat(result.get()).isEqualTo(entity);
    assertThat(result.get().getSupplierRef()).isEqualTo(ref);
  }

  @Test
  @DisplayName("Should return empty when transaction not found by supplier reference")
  void shouldReturnEmptyWhenNotFoundBySupplierRef() {
    String ref = "TX-NONEXISTENT";
    when(repository.findBySupplierRef(ref)).thenReturn(Optional.empty());

    Optional<Transactions> result = adapter.findBySupplierRef(ref);

    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("Should check existence by supplier reference")
  void shouldCheckExistsBySupplierRef() {
    String ref = "TX-9999";
    when(repository.existsBySupplierRef(ref)).thenReturn(true);

    assertThat(adapter.existsBySupplierRef(ref)).isTrue();
    verify(repository).existsBySupplierRef(ref);
  }

  @Test
  @DisplayName("Should check existence returns false when not exists")
  void shouldCheckExistsReturnsFalseWhenNotExists() {
    String ref = "TX-NONE";
    when(repository.existsBySupplierRef(ref)).thenReturn(false);

    assertThat(adapter.existsBySupplierRef(ref)).isFalse();
    verify(repository).existsBySupplierRef(ref);
  }

  @Test
  @DisplayName("Should save transaction entity and map data correctly")
  void shouldSaveTransactionSuccessfully() {
    UUID transactionId = UUID.randomUUID();
    UUID paymentId = UUID.randomUUID();
    Payments payment = Payments.builder().id(paymentId).build();
    PaymentsData paymentData = new PaymentsData();
    paymentData.setId(paymentId);

    Transactions entity =
        Transactions.builder()
            .id(transactionId)
            .payment(payment)
            .supplierRef("EFF-" + paymentId)
            .paymentProvider("EFFECTIVE")
            .amount(BigDecimal.valueOf(25000))
            .currency("COP")
            .status(TransactionStatus.APPROVED)
            .createdAt(OffsetDateTime.now())
            .build();

    TransactionsData data = new TransactionsData();
    data.setId(transactionId);
    data.setPayment(paymentData);
    data.setSupplierRef("EFF-" + paymentId);
    data.setPaymentProvider("EFFECTIVE");
    data.setAmount(BigDecimal.valueOf(25000));
    data.setCurrency("COP");
    data.setStatus(TransactionStatus.APPROVED);
    data.setCreatedAt(entity.getCreatedAt());

    when(mapper.toData(entity)).thenReturn(data);
    when(repository.saveAndFlush(data)).thenReturn(data);
    when(mapper.toEntity(data)).thenReturn(entity);

    Transactions result = adapter.save(entity);

    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(transactionId);
    assertThat(result.getPayment()).isEqualTo(payment);
    assertThat(result.getSupplierRef()).isEqualTo("EFF-" + paymentId);
    assertThat(result.getPaymentProvider()).isEqualTo("EFFECTIVE");
    assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(25000));
    assertThat(result.getCurrency()).isEqualTo("COP");
    assertThat(result.getStatus()).isEqualTo(TransactionStatus.APPROVED);

    verify(mapper).toData(entity);
    verify(repository).saveAndFlush(data);
    verify(mapper).toEntity(data);
  }
}
