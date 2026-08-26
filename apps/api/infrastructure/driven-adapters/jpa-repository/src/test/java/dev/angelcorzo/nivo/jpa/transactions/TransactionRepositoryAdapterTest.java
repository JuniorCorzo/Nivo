package dev.angelcorzo.nivo.jpa.transactions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.transactions.mappers.TransactionMapper;
import dev.angelcorzo.nivo.model.transactions.Transactions;
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
    Transactions entity = Transactions.builder().id(UUID.randomUUID()).build();

    when(repository.findBySupplierRef(ref)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    Optional<Transactions> result = adapter.findBySupplierRef(ref);

    assertThat(result).isPresent();
    assertThat(result.get()).isEqualTo(entity);
  }

  @Test
  @DisplayName("Should check existence by supplier reference")
  void shouldCheckExistsBySupplierRef() {
    String ref = "TX-9999";
    when(repository.existsBySupplierRef(ref)).thenReturn(true);

    assertThat(adapter.existsBySupplierRef(ref)).isTrue();
    verify(repository).existsBySupplierRef(ref);
  }
}
