package dev.angelcorzo.nivo.usecase.processpayment.strategies;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.commons.result.ResultUtils;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.model.payments.factories.PaymentFactory;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.model.payments.valueobject.ProviderMetadata;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.notifications.PaymentNotifier;
import dev.angelcorzo.nivo.usecase.processpayment.strategies.commands.PaymentCommand;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class PayLinkPaymentStrategy implements PaymentStrategy {
  private final PaymentsRepository paymentsRepository;
  private final ParkingTicketsRepository parkingTicketsRepository;
  private final PaymentProviderGateway paymentProviderGateway;
  private final PaymentNotifier paymentNotifier;

  @Override
  public Result<Payments, PaymentError> processPayment(PaymentCommand command) {
    final BigDecimal amount = command.amounts().getTotal();
    final ParkingTickets ticket =
        this.parkingTicketsRepository
            .findById(command.ticket().getId())
            .orElseThrow(() -> new ParkingTicketNotFound(command.ticket().getId()));

    Result<Payments, PaymentError> paymentIntent =
        ResultUtils.combine(
            () -> this.createPaymentIntent(ticket, amount),
            () -> this.processPayment(command, ticket, amount),
            this::updatePaymentsWithMetadata);

    return paymentIntent
        .onSuccess((_) -> this.updateTicketStatus(command.ticket().getId(), amount))
        .onSuccess(payments -> this.sendNotifications(payments, command.amounts()));
  }

  private Result<Payments, PaymentError> createPaymentIntent(
      ParkingTickets ticket, BigDecimal amount) {
    return this.paymentsRepository.processPayment(PaymentFactory.registerPayLink(ticket, amount));
  }

  private Result<ProviderMetadata, PaymentError> processPayment(
      PaymentCommand command, ParkingTickets ticket, BigDecimal amount) {
    return this.paymentProviderGateway.processPayment(ticket, amount, command.checkOut());
  }

  private Result<Payments, PaymentError> updatePaymentsWithMetadata(
      Payments paymentIntent, ProviderMetadata metadata) {
    paymentIntent.startCheckout(metadata);
    return this.paymentsRepository.processPayment(paymentIntent);
  }

  private void updateTicketStatus(UUID ticketId, BigDecimal amountToCharge) {
    this.parkingTicketsRepository.prepareCheckout(ticketId, amountToCharge);
  }

  private void sendNotifications(Payments paymentIntent, PriceDetailed priceDetailed) {
    paymentNotifier.notifyPaymentCheckout(paymentIntent, priceDetailed, priceDetailed.getName());
  }
}
