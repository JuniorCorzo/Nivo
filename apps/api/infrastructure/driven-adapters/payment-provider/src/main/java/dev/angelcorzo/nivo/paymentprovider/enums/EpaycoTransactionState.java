package dev.angelcorzo.nivo.paymentprovider.enums;

import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.transactions.enums.TransactionStatus;
import java.util.Arrays;
import lombok.Getter;

@Getter
public enum EpaycoTransactionState {
  ACCEPTED(1, PaymentStatus.PAID, TransactionStatus.APPROVED),
  REJECTED(2, PaymentStatus.FAILED, TransactionStatus.DECLINED),
  PENDING(3, PaymentStatus.PENDING_CHECKOUT, TransactionStatus.PENDING),
  FAILED(4, PaymentStatus.FAILED, TransactionStatus.FAILED),
  REVERSED(6, PaymentStatus.REFUNDED, TransactionStatus.REVERSED),
  HELD(7, PaymentStatus.PENDING_CHECKOUT, TransactionStatus.PENDING),
  STARTED(8, PaymentStatus.PENDING_CHECKOUT, TransactionStatus.PENDING),
  EXPIRED(9, PaymentStatus.CANCELED, TransactionStatus.EXPIRED),
  ABANDONED(10, PaymentStatus.CANCELED, TransactionStatus.CANCELED),
  CANCELED(11, PaymentStatus.CANCELED, TransactionStatus.CANCELED);

  private final int code;
  private final PaymentStatus paymentStatus;
  private final TransactionStatus transactionStatus;

  EpaycoTransactionState(int code, PaymentStatus paymentStatus, TransactionStatus transactionStatus) {
    this.code = code;
    this.paymentStatus = paymentStatus;
    this.transactionStatus = transactionStatus;
  }

  public static EpaycoTransactionState fromCode(String codeRaw) {
    if (codeRaw == null || codeRaw.isBlank()) return null;
    int code = Integer.parseInt(codeRaw.trim());
    return Arrays.stream(values())
        .filter(v -> v.code == code)
        .findFirst()
        .orElse(EpaycoTransactionState.FAILED);
  }
}
