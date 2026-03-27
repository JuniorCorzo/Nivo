package dev.angelcorzo.nivo.jpa.transactions;

import dev.angelcorzo.nivo.jpa.payments.PaymentsData;
import dev.angelcorzo.nivo.jpa.transactions.converts.EncryptedResponseConverter;
import dev.angelcorzo.nivo.model.transactions.enums.TransactionStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Getter
@Setter
@Entity
@Table(name = "transactions")
public class TransactionsData {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", nullable = false)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "payment_id", referencedColumnName = "id", nullable = false)
  private PaymentsData payment;

  @Column(name = "supplier_ref", nullable = false, unique = true)
  private String supplierRef;

  @Column(name = "transaction_id")
  private String transactionId;

  @Column(name = "payment_provider", nullable = false)
  private String paymentProvider;

  @Column(name = "amount", nullable = false)
  private BigDecimal amount;

  @Column(name = "currency", nullable = false)
  private String currency;

  @Column(name = "status", nullable = false)
  @Enumerated(EnumType.STRING)
  private TransactionStatus status;

  @Column(name = "gateway_response")
  @Convert(converter = EncryptedResponseConverter.class)
  private String gatewayResponse;

  @Column(name = "created_at")
  @CreationTimestamp
  private OffsetDateTime createdAt;
}
