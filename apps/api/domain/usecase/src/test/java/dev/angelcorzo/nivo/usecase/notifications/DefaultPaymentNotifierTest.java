package dev.angelcorzo.nivo.usecase.notifications;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.commons.notifications.valueobjects.PaymentCheckoutData;
import dev.angelcorzo.nivo.model.commons.notifications.valueobjects.PaymentCompletedData;
import dev.angelcorzo.nivo.model.commons.valueobjects.AppProperties;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceLine;
import dev.angelcorzo.nivo.usecase.sendnotifications.SendNotificationsUseCase;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("DefaultPaymentNotifier Tests")
class DefaultPaymentNotifierTest {

  private SendNotificationsUseCase sendNotificationsUseCase;
  private AppProperties appProperties;
  private DefaultPaymentNotifier notifier;

  private final UUID tenantId = UUID.randomUUID();
  private final UUID userId = UUID.randomUUID();
  private final UserReference user =
      new UserReference(userId, "Jane Doe", "jane@example.com", Roles.DRIVER, "9876543210");
  private final TenantReference tenant = new TenantReference(tenantId, "Tenant Name");

  @BeforeEach
  void setUp() {
    sendNotificationsUseCase = mock(SendNotificationsUseCase.class);
    appProperties = mock(AppProperties.class);
    when(appProperties.getCurrency()).thenReturn("USD");
    when(appProperties.getCtaUrl()).thenReturn("https://cta.example.com");
    when(appProperties.getCompanyName()).thenReturn("Nivo Inc");
    when(appProperties.getSupportUrl()).thenReturn("https://support.example.com");
    when(appProperties.getSocialUrl()).thenReturn("https://social.example.com");
    when(appProperties.getUnsubscribeUrl()).thenReturn("https://unsubscribe.example.com");
    when(appProperties.getAddressCompany()).thenReturn("123 Street");

    notifier = new DefaultPaymentNotifier(sendNotificationsUseCase, appProperties);
  }

  @Nested
  @DisplayName("notifyPaymentCheckout")
  class NotifyPaymentCheckout {

    @Test
    @DisplayName("Should send notification when payment and user are present")
    void shouldSendNotificationWhenPaymentAndUserArePresent() {
      PriceDetailed priceDetailed = PriceDetailed.of("Standard Rate");
      priceDetailed.addLine(PriceLine.of("Parking Fee", new BigDecimal("15.00")));

      Payments payment =
          Payments.builder()
              .tenant(tenant)
              .user(user)
              .externalPaymentId("EXT-12345")
              .amount(new BigDecimal("15.00"))
              .checkoutExpiresAt(OffsetDateTime.now().plusHours(1))
              .checkoutUrl("https://checkout.example.com/pay")
              .build();

      notifier.notifyPaymentCheckout(payment, priceDetailed, "Payment for ticket");

      verify(sendNotificationsUseCase)
          .send(
              eq(NotificationEvents.PAYMENT_CHECKOUT),
              eq(NotificationsChannel.EMAIL),
              eq("jane@example.com"),
              any(PaymentCheckoutData.class),
              eq(tenantId),
              eq(userId));
    }

    @Test
    @DisplayName("Should not send notification when payment is null")
    void shouldNotSendNotificationWhenPaymentIsNull() {
      PriceDetailed priceDetailed = PriceDetailed.of("Standard Rate");

      notifier.notifyPaymentCheckout(null, priceDetailed, "Payment for ticket");

      verifyNoInteractions(sendNotificationsUseCase);
    }

    @Test
    @DisplayName("Should not send notification when payment user is null")
    void shouldNotSendNotificationWhenPaymentUserIsNull() {
      PriceDetailed priceDetailed = PriceDetailed.of("Standard Rate");

      Payments payment =
          Payments.builder()
              .tenant(tenant)
              .user(null)
              .externalPaymentId("EXT-12345")
              .amount(new BigDecimal("15.00"))
              .build();

      notifier.notifyPaymentCheckout(payment, priceDetailed, "Payment for ticket");

      verifyNoInteractions(sendNotificationsUseCase);
    }
  }

  @Nested
  @DisplayName("notifyPaymentCompleted")
  class NotifyPaymentCompleted {

    @Test
    @DisplayName("Should send notification when payment and user are present")
    void shouldSendNotificationWhenPaymentAndUserArePresent() {
      Payments payment =
          Payments.builder()
              .tenant(tenant)
              .user(user)
              .externalPaymentId("EXT-12345")
              .amount(new BigDecimal("25.00"))
              .paymentMethod(PaymentsMethods.EFFECTIVE)
              .paymentDate(OffsetDateTime.now())
              .build();

      notifier.notifyPaymentCompleted(payment);

      verify(sendNotificationsUseCase)
          .send(
              eq(NotificationEvents.PAYMENT_COMPLETED),
              eq(NotificationsChannel.EMAIL),
              eq("jane@example.com"),
              any(PaymentCompletedData.class),
              eq(tenantId),
              eq(userId));
    }

    @Test
    @DisplayName("Should not send notification when payment is null")
    void shouldNotSendNotificationWhenPaymentIsNull() {
      notifier.notifyPaymentCompleted(null);

      verifyNoInteractions(sendNotificationsUseCase);
    }

    @Test
    @DisplayName("Should not send notification when payment user is null")
    void shouldNotSendNotificationWhenPaymentUserIsNull() {
      Payments payment =
          Payments.builder()
              .tenant(tenant)
              .user(null)
              .externalPaymentId("EXT-12345")
              .amount(new BigDecimal("25.00"))
              .build();

      notifier.notifyPaymentCompleted(payment);

      verifyNoInteractions(sendNotificationsUseCase);
    }
  }
}
