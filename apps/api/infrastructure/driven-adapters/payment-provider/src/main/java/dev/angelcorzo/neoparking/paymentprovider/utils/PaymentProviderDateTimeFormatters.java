package dev.angelcorzo.neoparking.paymentprovider.utils;

import java.time.format.DateTimeFormatter;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class PaymentProviderDateTimeFormatters {
  public static final DateTimeFormatter REQUEST_EPAYCO_DATE_TIME_FORMAT =
      DateTimeFormatter.ISO_OFFSET_DATE_TIME;

  public static final DateTimeFormatter RESPONSE_EPAYCO_DATE_TIME_FORMAT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
}
