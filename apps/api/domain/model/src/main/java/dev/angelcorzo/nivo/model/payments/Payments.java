package dev.angelcorzo.nivo.model.payments;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.model.payments.valueobject.ProviderMetadata;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Payments {
  private UUID id;
  private TenantReference tenant;
  private UserReference user;
  private ParkingTickets parkingTicket;
  private BigDecimal amount;
  private OffsetDateTime paymentDate;
  private PaymentsMethods paymentMethod;
  private PaymentStatus status;
  private String provider;
  private String externalPaymentId;
  private String checkoutSessionId;
  private String checkoutUrl;
  private OffsetDateTime checkoutExpiresAt;
  private Object providerCreateResponse;
  private OffsetDateTime createdAt;
  private OffsetDateTime updatedAt;

  public void startCheckout(ProviderMetadata metadata) {
    this.status = PaymentStatus.PENDING_PAYMENT;

    this.provider = metadata.provider();
    this.externalPaymentId = metadata.externalPaymentId();
    this.checkoutSessionId = metadata.checkoutSessionId();
    this.checkoutUrl = metadata.checkoutUrl();
    this.checkoutExpiresAt = metadata.checkoutExpiresAt();
    this.providerCreateResponse = metadata.rawResponse();
  }
}
