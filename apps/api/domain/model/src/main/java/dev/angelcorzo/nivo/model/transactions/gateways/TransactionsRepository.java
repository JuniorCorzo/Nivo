package dev.angelcorzo.nivo.model.transactions.gateways;

import dev.angelcorzo.nivo.model.transactions.Transactions;
import java.util.Optional;

public interface TransactionsRepository {
  Optional<Transactions> findBySupplierRef(String supplierRef);

  boolean existsBySupplierRef(String supplierRef);

  Transactions save(Transactions transaction);
}
