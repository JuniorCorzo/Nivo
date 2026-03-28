package dev.angelcorzo.nivo.jpa.transactions;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TransactionRepositoryData extends JpaRepository<TransactionsData, UUID> {
  Optional<TransactionsData> findBySupplierRef(String supplierRef);

  @Query(
      "SELECT COUNT(t) > 0 FROM TransactionsData t WHERE NOT t.status = PENDING AND t.supplierRef = :supplierRef")
  boolean existsBySupplierRef(String supplierRef);
}
