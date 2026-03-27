package dev.angelcorzo.nivo.model.transactions;

import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.transactions.enums.TransactionStatus;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Transactions {
  private UUID id;
  private Payments payment;
  private String supplierRef;
  private String transactionId;
  private String paymentProvider;
  private BigDecimal amount;
  private String currency;
  private TransactionStatus status;
  private Object gatewayResponse;
  private OffsetDateTime createdAt;
}