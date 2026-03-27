package dev.angelcorzo.nivo.paymentprovider;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.model.payments.valueobject.ProviderMetadata;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.EmailCheckOut;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.NoSendCheckOut;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.SMSCheckOut;
import dev.angelcorzo.nivo.model.transactions.Transactions;
import dev.angelcorzo.nivo.paymentprovider.client.PaymentProviderClient;
import dev.angelcorzo.nivo.paymentprovider.config.PaymentProviderProperties;
import dev.angelcorzo.nivo.paymentprovider.dtos.EpaycoConfirmationDTO;
import dev.angelcorzo.nivo.paymentprovider.dtos.request.CreatePayLink;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.CreatePayLinkResponse;
import dev.angelcorzo.nivo.paymentprovider.utils.EpaycoSignature;
import dev.angelcorzo.nivo.paymentprovider.utils.PaymentProviderDateTimeFormatters;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;

@RequiredArgsConstructor
@Component
public class EpaycoPaymentAdapter implements PaymentProviderGateway {
  private final PaymentProviderClient paymentProviderClient;
  private final PaymentProviderProperties paymentProviderProperties;

  @Override
  public Result<Transactions, PaymentError> getTransactionDetails(String checkoutSessionId) {
    return this.paymentProviderClient
        .getPayLinkDetails(checkoutSessionId)
        .map(
            paymentDetails ->
                Transactions.builder()
                    .supplierRef(paymentDetails.reference())
                    .transactionId(String.valueOf(paymentDetails.id()))
                    .amount(paymentDetails.amount())
                    .currency(paymentDetails.currency())
                    .paymentProvider(this.paymentProviderProperties.getProviderName())
                    .gatewayResponse(paymentDetails)
                    .status(paymentDetails.state().getTransactionStatus())
                    .build());
  }

  @Override
  public Result<ProviderMetadata, PaymentError> processPayment(
      ParkingTickets tickets, BigDecimal amount, CheckOut command) {
    if (command.paymentMethod() == null || command.paymentMethod() != PaymentsMethods.PAY_LINK)
      throw new IllegalArgumentException("Unsupported payment method: " + command.paymentMethod());

    return this.createPayLink(tickets, amount, command);
  }

  @Override
  public Result<Transactions, PaymentError> confirmationPay(Map<String, String> receipt) {
    final MultiValueMap<String, String> values = MultiValueMap.fromSingleValue(receipt);
    final EpaycoConfirmationDTO epaycoConfirmation = EpaycoConfirmationDTO.of(values);

    Result<String, PaymentError> signature =
        EpaycoSignature.validatedSignature(
            epaycoConfirmation, this.paymentProviderProperties.getPublicKey());

    if (signature.isFailure()) return Result.failure(signature.getError());

    final Transactions transaction =
        Transactions.builder()
            .supplierRef(epaycoConfirmation.refPayco())
            .transactionId(epaycoConfirmation.transactionId())
            .amount(epaycoConfirmation.amount())
            .currency("COP")
            .paymentProvider(this.paymentProviderProperties.getProviderName())
            .gatewayResponse(epaycoConfirmation)
            .status(epaycoConfirmation.codTransactionState().getTransactionStatus())
            .build();

    return Result.success(transaction);
  }

  private Result<ProviderMetadata, PaymentError> createPayLink(
      ParkingTickets tickets, BigDecimal amount, CheckOut method) {
    final CreatePayLink payLinkRequest = this.buildPayLinkRequest(tickets, amount, method);

    final Result<CreatePayLinkResponse, PaymentError> payLinkResponse =
        this.paymentProviderClient.createPayLink(payLinkRequest);

    return payLinkResponse.map(
        result -> result.toProviderMetadata(this.paymentProviderProperties.getProviderName()));
  }

  private CreatePayLink buildPayLinkRequest(
      ParkingTickets tickets, BigDecimal amount, CheckOut checkOut) {
    final CreatePayLink.CreatePayLinkBuilder payLinkBuilder = CreatePayLink.builder();
    final String expiresAt =
        Instant.now()
            .plus(Duration.ofHours(1))
            .atOffset(ZoneOffset.UTC)
            .format(PaymentProviderDateTimeFormatters.REQUEST_EPAYCO_DATE_TIME_FORMAT);

    final String title =
        String.format("Pago de tiquete de parqueo con rate: %s", tickets.getRate().name());

    this.configurePaymentMethod(checkOut, payLinkBuilder);
    return payLinkBuilder
        .id(0)
        .title(title)
        .description(tickets.getRate().description())
        .quantity(1)
        .currency("COP")
        .amount(amount)
        .urlConfirmation(this.paymentProviderProperties.getConfirmationUrl())
        .methodConfirmation(this.paymentProviderProperties.getConfirmationMethod())
        .expirationDate(expiresAt)
        .build();
  }

  private void configurePaymentMethod(
      CheckOut checkOut, CreatePayLink.CreatePayLinkBuilder payLinkBuilder) {
    switch (checkOut) {
      case EmailCheckOut email -> payLinkBuilder.typeSell((byte) 1).email(email.email());
      case NoSendCheckOut _ -> payLinkBuilder.typeSell((byte) 2);
      case SMSCheckOut sms -> payLinkBuilder.typeSell((byte) 3).mobilePhone(sms.mobilePhone());
    }
  }
}
