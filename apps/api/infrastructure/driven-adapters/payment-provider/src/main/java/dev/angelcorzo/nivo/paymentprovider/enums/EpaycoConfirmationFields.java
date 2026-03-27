package dev.angelcorzo.nivo.paymentprovider.enums;

import lombok.Getter;

@Getter
public enum EpaycoConfirmationFields {
  X_CLIENTE_ID_CLIENTE("x_cliente_id_cliente"),
  X_REF_PAYCO("x_ref_payco"),
  X_TRANSACTION_ID("x_transaction_id"),
  X_ID_FACTURA("x_id_factura"),

  // Valores / moneda
  X_AMOUNT("x_amount"),
  X_CURRENCY_CODE("x_currency_code"),

  // Estado / respuesta
  X_COD_TRANSACTION_STATE("x_cod_transaction_state"),
  X_TRANSACTION_STATE("x_transaction_state"),
  X_TRANSACTION_DATE("x_fecha_transaccion"),
  X_RESPONSE("x_response"),
  X_RESPONSE_REASON_TEXT("x_response_reason_text"),
  X_COD_RESPONSE("x_cod_response"),

  // Seguridad / ambiente
  X_SIGNATURE("x_signature"),
  X_TEST_REQUEST("x_test_request"),

  // Extras (útiles para pasar ids internos)
  X_EXTRA1("x_extra1"),
  X_EXTRA2("x_extra2"),
  X_EXTRA3("x_extra3"),
  X_EXTRA4("x_extra4"),
  X_EXTRA5("x_extra5"),
  X_EXTRA6("x_extra6"),
  X_EXTRA7("x_extra7"),
  X_EXTRA8("x_extra8"),
  X_EXTRA9("x_extra9"),
  X_EXTRA10("x_extra10");

  private final String key;

  EpaycoConfirmationFields(String key) {
    this.key = key;
  }
}
