package dev.angelcorzo.nivo.paymentprovider.dtos.response;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import dev.angelcorzo.nivo.model.transactions.enums.TransactionStatus;
import java.math.BigDecimal;
import lombok.Getter;

public record ListPayLinkResponse(
    long id,
    String txtCode,
    String date,
    String title,
    String reference,
    String currency,
    BigDecimal amount,
    int typeSell,
    State state,
    long link,
    String routeLink) {

  @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
  public ListPayLinkResponse(
      @JsonProperty("id") long id,
      @JsonProperty("txtcodigo") String txtCode,
      @JsonProperty("date") String date,
      @JsonProperty("title") String title,
      @JsonProperty("reference") String reference,
      @JsonProperty("currency") String currency,
      @JsonProperty("amount") BigDecimal amount,
      @JsonProperty("typeSell") int typeSell,
      @JsonProperty("state") int state,
      @JsonProperty("link") long link,
      @JsonProperty("routeLink") String routeLink) {
    this(
        id,
        txtCode,
        date,
        title,
        reference,
        currency,
        amount,
        typeSell,
        State.fromCode(state),
        link,
        routeLink);
  }

  @Getter
  public enum State {
    DELETED(0, TransactionStatus.CANCELED),
    PENDING_PAYMENT(1, TransactionStatus.PENDING),
    PAID(2, TransactionStatus.APPROVED),
    PENDING_LAST_PAYMENT(3, TransactionStatus.PENDING),
    EXPIRED(4, TransactionStatus.EXPIRED);

    private final int code;
    private final TransactionStatus transactionStatus;

    State(int code, TransactionStatus transactionStatus) {
      this.transactionStatus = transactionStatus;
      this.code = code;
    }

    public static State fromCode(int code) {
      return switch (code) {
        case 0 -> DELETED;
        case 1 -> PENDING_PAYMENT;
        case 2 -> PAID;
        case 3 -> PENDING_LAST_PAYMENT;
        case 4 -> EXPIRED;
        default -> null;
      };
    }
  }
}
