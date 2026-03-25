package dev.angelcorzo.neoparking.model.commons.notifications.valueobjects;

import dev.angelcorzo.neoparking.model.commons.notifications.NotificationsData;
import java.util.List;
import lombok.Builder;

@Builder
public record PaymentCheckoutData(
    String userName,
    String paymentReference,
    String paymentAmount,
    String paymentCurrency,
    String dueDate,
    String description,
    List<Item> items,
    String ctaUrl,
    String companyName,
    String supportUrl,
    String socialUrl,
    String unsubscribeUrl,
    String companyAddress)
    implements NotificationsData {

  @Builder
  public record Item(
      String name,
      String description,
      String parkingName,
      String spotLabel,
      String vehiclePlate,
      String startTime,
      String endTime,
      String quantity,
      String unitAmount,
      String amount) {}
}
