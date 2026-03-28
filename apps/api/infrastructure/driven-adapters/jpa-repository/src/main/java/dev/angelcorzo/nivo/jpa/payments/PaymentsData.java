package dev.angelcorzo.nivo.jpa.payments;

import com.fasterxml.jackson.databind.JsonNode;
import dev.angelcorzo.nivo.jpa.parkingtickets.ParkingTicketsData;
import dev.angelcorzo.nivo.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.jpa.transactions.TransactionsData;
import dev.angelcorzo.nivo.jpa.users.UsersData;
import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.*;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payments")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentsData {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id", referencedColumnName = "id")
  private TenantsData tenant;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private UsersData user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parking_ticket_id", referencedColumnName = "id")
  private ParkingTicketsData parkingTicket;

  @Column(name = "amount", nullable = false)
  private BigDecimal amount;

  @Column(name = "payment_date")
  private OffsetDateTime paymentDate;

  @Column(name = "payment_method", nullable = false)
  @Enumerated(EnumType.STRING)
  private PaymentsMethods paymentMethod;

  @Column(name = "status")
  @ColumnDefault("PENDING_CHECKOUT")
  @Enumerated(EnumType.STRING)
  private PaymentStatus status;

  @Column(name = "provider")
  private String provider;

  @Column(name = "external_payment_id")
  private String externalPaymentId;

  @Column(name = "checkout_session_id")
  private String checkoutSessionId;

  @Column(name = "checkout_url")
  private String checkoutUrl;

  @Column(name = "checkout_expires_at")
  private OffsetDateTime checkoutExpiresAt;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "provider_create_response", columnDefinition = "jsonb")
  private JsonNode providerCreateResponse;

  @Column(name = "created_at", nullable = false, updatable = false)
  @CreationTimestamp
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  @UpdateTimestamp
  private OffsetDateTime updatedAt;

  @OneToMany(mappedBy = "payment", fetch = FetchType.LAZY)
  private List<TransactionsData> transactions;
}
