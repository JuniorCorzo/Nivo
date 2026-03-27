package dev.angelcorzo.nivo.paymentprovider.dtos;

import dev.angelcorzo.nivo.paymentprovider.enums.EpaycoConfirmationFields;
import dev.angelcorzo.nivo.paymentprovider.enums.EpaycoTransactionState;
import dev.angelcorzo.nivo.paymentprovider.utils.PaymentProviderDateTimeFormatters;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import lombok.Builder;
import org.springframework.util.MultiValueMap;

@Builder
public record EpaycoConfirmationDTO(
    String clienteIdCliente,
    String refPayco,
    String transactionId,
    String idFactura,
    BigDecimal amount,
    String currencyCode,
    EpaycoTransactionState codTransactionState,
    String transactionState,
    OffsetDateTime transactionDate,
    String response,
    String responseReasonText,
    String codResponse,
    String signature,
    String testRequest,
    String idempotencyKey) {

  public static EpaycoConfirmationDTO of(MultiValueMap<String, String> form) {
    return EpaycoConfirmationDTO.builder()
        .clienteIdCliente(get(form, EpaycoConfirmationFields.X_CLIENTE_ID_CLIENTE))
        .refPayco(get(form, EpaycoConfirmationFields.X_REF_PAYCO))
        .transactionId(get(form, EpaycoConfirmationFields.X_TRANSACTION_ID))
        .idFactura(get(form, EpaycoConfirmationFields.X_ID_FACTURA))
        .amount(getBigDecimal(form, EpaycoConfirmationFields.X_AMOUNT))
        .currencyCode(get(form, EpaycoConfirmationFields.X_CURRENCY_CODE))
        .codTransactionState(
            EpaycoTransactionState.fromCode(
                get(form, EpaycoConfirmationFields.X_COD_TRANSACTION_STATE)))
        .transactionState(get(form, EpaycoConfirmationFields.X_TRANSACTION_STATE))
        .transactionDate(getDateTime(form, EpaycoConfirmationFields.X_TRANSACTION_DATE))
        .response(get(form, EpaycoConfirmationFields.X_RESPONSE))
        .responseReasonText(get(form, EpaycoConfirmationFields.X_RESPONSE_REASON_TEXT))
        .codResponse(get(form, EpaycoConfirmationFields.X_COD_RESPONSE))
        .signature(get(form, EpaycoConfirmationFields.X_SIGNATURE))
        .testRequest(get(form, EpaycoConfirmationFields.X_TEST_REQUEST))
        .idempotencyKey(get(form, EpaycoConfirmationFields.X_EXTRA1))
        .build();
  }

  private static String get(MultiValueMap<String, String> form, EpaycoConfirmationFields field) {
    return form.getFirst(field.getKey());
  }

  private static OffsetDateTime getDateTime(
      MultiValueMap<String, String> form, EpaycoConfirmationFields field) {
    final String value = get(form, field);
    if (value == null || value.isBlank()) return null;

    return LocalDateTime.parse(
            value, PaymentProviderDateTimeFormatters.RESPONSE_EPAYCO_DATE_TIME_FORMAT)
        .atOffset(ZoneOffset.UTC);
  }

  private static BigDecimal getBigDecimal(
      MultiValueMap<String, String> form, EpaycoConfirmationFields field) {
    String value = get(form, field);
    if (value == null || value.isBlank()) return null;
    return new BigDecimal(value);
  }
}
