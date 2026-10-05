package dev.angelcorzo.nivo.domain.usecase.payment.strategies.commands;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;

public record PaymentCommand(ParkingTickets ticket, PriceDetailed amounts, CheckOut checkOut) {
  public static PaymentCommand of(ParkingTickets ticket, PriceDetailed amounts, CheckOut checkOut) {
    return new PaymentCommand(ticket, amounts, checkOut);
  }
}
