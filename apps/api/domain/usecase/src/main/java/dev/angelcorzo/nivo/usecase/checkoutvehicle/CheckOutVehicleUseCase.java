package dev.angelcorzo.nivo.usecase.checkoutvehicle;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.model.payments.exceptions.ProcessPaymentException;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.usecase.calculaterate.CalculateRateUseCase;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.processpayment.ProcessPaymentUseCase;
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
