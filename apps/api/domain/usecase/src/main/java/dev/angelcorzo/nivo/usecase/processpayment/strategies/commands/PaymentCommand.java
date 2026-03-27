package dev.angelcorzo.nivo.usecase.processpayment.strategies.commands;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;

public record PaymentCommand(ParkingTickets ticket, PriceDetailed amounts, CheckOut checkOut) {
  public static PaymentCommand of(ParkingTickets ticket, PriceDetailed amounts, CheckOut checkOut) {
    return new PaymentCommand(ticket, amounts, checkOut);
  }
}
