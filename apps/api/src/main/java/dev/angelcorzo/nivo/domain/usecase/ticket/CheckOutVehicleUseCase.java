package dev.angelcorzo.nivo.domain.usecase.ticket;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.payments.Payments;
import dev.angelcorzo.nivo.domain.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.domain.model.payments.exceptions.ProcessPaymentException;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.domain.usecase.rate.CalculateRateUseCase;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.payment.ProcessPaymentUseCase;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CheckOutVehicleUseCase {
  private final ProcessPaymentUseCase processPayment;
  private final CalculateRateUseCase calculateRateUseCase;
  private final ParkingTicketsRepository parkingTicketsRepository;

  public Payments execute(CheckOut command) {
    final UUID ticketId = command.ticketId();
    final ParkingTickets ticket =
        this.parkingTicketsRepository
            .findById(ticketId)
            .orElseThrow(
                () -> new ProcessPaymentException(new PaymentError.TicketNotFound(ticketId)));

    if (ticket.getStatus() == ParkingTicketStatus.CLOSED) {
      throw new ProcessPaymentException(new PaymentError.Duplicate(ticketId));
    }

    final PriceDetailed amounts = this.calculateRateUseCase.execute(command.ticketId());
    return this.processPayment.execute(ticket, amounts, command);
  }
}
