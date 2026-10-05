package dev.angelcorzo.nivo.infrastructure.adapter.jpa.transactions;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.transactions.mappers.TransactionMapper;
import dev.angelcorzo.nivo.domain.model.transactions.Transactions;
import dev.angelcorzo.nivo.domain.model.transactions.gateways.TransactionsRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class TransactionRepositoryAdapter
    extends AdapterOperations<Transactions, TransactionsData, UUID, TransactionRepositoryData>
    implements TransactionsRepository {

  /**
   * Constructor for AdapterOperations.
   *
   * @param repository The JPA repository instance.
   * @param mapper The mapper for converting between domain and data entities.
   */
  protected TransactionRepositoryAdapter(
      TransactionRepositoryData repository, TransactionMapper mapper) {
    super(repository, mapper);
  }

  @Override
  public Optional<Transactions> findBySupplierRef(String supplierRef) {
    return super.repository.findBySupplierRef(supplierRef).map(super::toEntity);
  }

  @Override
  public boolean existsBySupplierRef(String supplierRef) {
    return super.repository.existsBySupplierRef(supplierRef);
  }
}
