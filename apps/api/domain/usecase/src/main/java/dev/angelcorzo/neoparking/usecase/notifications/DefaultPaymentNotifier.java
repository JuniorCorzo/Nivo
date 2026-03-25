package dev.angelcorzo.neoparking.usecase.notifications;

import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.neoparking.model.commons.notifications.valueobjects.PaymentCheckoutData;
import dev.angelcorzo.neoparking.model.commons.notifications.valueobjects.PaymentCompletedData;
import dev.angelcorzo.neoparking.model.commons.valueobjects.AppProperties;
import dev.angelcorzo.neoparking.model.payments.Payments;
import dev.angelcorzo.neoparking.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.neoparking.usecase.sendnotifications.SendNotificationsUseCase;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class DefaultPaymentNotifier implements PaymentNotifier {
  private final SendNotificationsUseCase sendNotificationsUseCase;
  private final AppProperties appProperties;

  @Override
  public void notifyPaymentCheckout(
      Payments payment, PriceDetailed priceDetailed, String description) {

    final List<PaymentCheckoutData.Item> items =
        priceDetailed.getBreakpoint().stream()
            .map(
                breakpoint ->
                    PaymentCheckoutData.Item.builder()
                        .name(breakpoint.concept())
                        .amount(breakpoint.amount().toPlainString())
                        .build())
            .toList();

    final PaymentCheckoutData content =
        PaymentCheckoutData.builder()
            .userName(payment.getUser().fullName())
            .paymentReference(payment.getExternalPaymentId())
            .paymentAmount(payment.getAmount().toPlainString())
            .paymentCurrency(appProperties.getCurrency())
            .items(items)
            .dueDate(
                payment.getCheckoutExpiresAt() != null
                    ? payment.getCheckoutExpiresAt().toString()
                    : null)
            .ctaUrl(payment.getCheckoutUrl())
            .companyName(this.appProperties.getCompanyName())
            .supportUrl(this.appProperties.getSupportUrl())
            .socialUrl(this.appProperties.getSocialUrl())
            .unsubscribeUrl(this.appProperties.getUnsubscribeUrl())
            .companyAddress(this.appProperties.getAddressCompany())
            .build();

    this.sendNotificationsUseCase.send(
        NotificationEvents.PAYMENT_CHECKOUT,
        NotificationsChannel.EMAIL,
        payment.getUser().email(),
        content,
        payment.getTenant().id(),
        payment.getUser().id());
  }

  @Override
  public void notifyPaymentCompleted(Payments payment) {
    final PaymentCompletedData content =
        PaymentCompletedData.builder()
            .userName(payment.getUser().fullName())
            .paymentReference(payment.getExternalPaymentId())
            .paymentAmount(payment.getAmount().toPlainString())
            .paymentMethod(
                payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null)
            .paymentDate(
                payment.getPaymentDate() != null ? payment.getPaymentDate().toString() : null)
            .ctaUrl(this.appProperties.getCtaUrl())
            .companyName(this.appProperties.getCompanyName())
            .supportUrl(this.appProperties.getSupportUrl())
            .socialUrl(this.appProperties.getSocialUrl())
            .unsubscribeUrl(this.appProperties.getUnsubscribeUrl())
            .companyAddress(this.appProperties.getAddressCompany())
            .build();

    this.sendNotificationsUseCase.send(
        NotificationEvents.PAYMENT_COMPLETED,
        NotificationsChannel.EMAIL,
        payment.getUser().email(),
        content,
        payment.getTenant().id(),
        payment.getUser().id());
  }
}
