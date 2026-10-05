package dev.angelcorzo.nivo.domain.model.transactions.gateways;

import dev.angelcorzo.nivo.domain.model.transactions.Transactions;
import java.util.Optional;

public interface TransactionsRepository {
  Optional<Transactions> findBySupplierRef(String supplierRef);

  boolean existsBySupplierRef(String supplierRef);

  Transactions save(Transactions transaction);
}
