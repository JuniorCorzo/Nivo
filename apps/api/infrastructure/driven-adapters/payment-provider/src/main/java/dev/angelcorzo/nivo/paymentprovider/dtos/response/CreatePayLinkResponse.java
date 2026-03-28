package dev.angelcorzo.nivo.paymentprovider.dtos.response;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import dev.angelcorzo.nivo.model.payments.valueobject.ProviderMetadata;
import dev.angelcorzo.nivo.paymentprovider.config.json.decorators.StripQuotes;
import dev.angelcorzo.nivo.paymentprovider.utils.PaymentProviderDateTimeFormatters;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

public record CreatePayLinkResponse(
    long id,
    @StripQuotes String title,
    @StripQuotes String description,
    @StripQuotes String date,
    int state,
    @StripQuotes String txtCode,
    long clientId,
    int onePayment,
    int quantity,
    int baseTax,
    @StripQuotes String currency,
    @StripQuotes String typeSell,
    @StripQuotes String urlConfirmation,
    @StripQuotes String urlResponse,
    int tax,
    int icoTax,
    int amount,
    @StripQuotes String invoceNumber,
    @StripQuotes String routeQr,
    @StripQuotes String routeLink,
    @StripQuotes String expirationDate) {

  @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
  public CreatePayLinkResponse(
      @JsonProperty("id") long id,
      @StripQuotes @JsonProperty("title") String title,
      @StripQuotes @JsonProperty("description") String description,
      @StripQuotes @JsonProperty("date") String date,
      @JsonProperty("state") int state,
      @StripQuotes @JsonProperty("txtCode") String txtCode,
      @JsonProperty("clientId") long clientId,
      @JsonProperty("onePayment") int onePayment,
      @JsonProperty("quantity") int quantity,
      @JsonProperty("baseTax") int baseTax,
      @StripQuotes @JsonProperty("currency") String currency,
      @StripQuotes @JsonProperty("typeSell") String typeSell,
      @StripQuotes @JsonProperty("urlConfirmation") String urlConfirmation,
      @StripQuotes @JsonProperty("urlResponse") String urlResponse,
      @JsonProperty("tax") int tax,
      @JsonProperty("icoTax") int icoTax,
      @JsonProperty("amount") int amount,
      @StripQuotes @JsonProperty("invoceNumber") String invoceNumber,
      @StripQuotes @JsonProperty("routeQr") String routeQr,
      @StripQuotes @JsonProperty("routeLink") String routeLink,
      @StripQuotes @JsonProperty("expirationDate") String expirationDate) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.date = date;
    this.state = state;
    this.txtCode = txtCode;
    this.clientId = clientId;
    this.onePayment = onePayment;
    this.quantity = quantity;
    this.baseTax = baseTax;
    this.currency = currency;
    this.typeSell = typeSell;
    this.urlConfirmation = urlConfirmation;
    this.urlResponse = urlResponse;
    this.tax = tax;
    this.icoTax = icoTax;
    this.amount = amount;
    this.invoceNumber = invoceNumber;
    this.routeQr = routeQr;
    this.routeLink = routeLink;
    this.expirationDate = expirationDate;
  }

  public ProviderMetadata toProviderMetadata(String providerName) {
    return ProviderMetadata.builder()
        .provider(providerName)
        .externalPaymentId(String.valueOf(id()))
        .checkoutSessionId(invoceNumber())
        .checkoutUrl(routeLink())
        .checkoutExpiresAt(
            LocalDateTime.parse(
                    expirationDate(),
                    PaymentProviderDateTimeFormatters.RESPONSE_EPAYCO_DATE_TIME_FORMAT)
                .atOffset(ZoneOffset.UTC))
        .rawResponse(this)
        .build();
  }
}
