package dev.angelcorzo.nivo.domain.model.payments.factories;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.payments.Payments;
import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentsMethods;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class PaymentFactory {
  public static Payments registerEffective(ParkingTickets ticket, BigDecimal amount) {
    return Payments.builder()
        .tenant(ticket.getTenant())
        .user(ticket.getUser())
        .parkingTicket(ticket)
        .amount(amount)
        .paymentDate(OffsetDateTime.now())
        .paymentMethod(PaymentsMethods.EFFECTIVE)
        .status(PaymentStatus.PAID)
        .build();
  }

  public static Payments registerPayLink(ParkingTickets ticket, BigDecimal amount) {
    return Payments.builder()
        .tenant(ticket.getTenant())
        .user(ticket.getUser())
        .parkingTicket(ticket)
        .amount(amount)
        .paymentMethod(PaymentsMethods.PAY_LINK)
        .status(PaymentStatus.PENDING_CHECKOUT)
        .build();
  }
}
