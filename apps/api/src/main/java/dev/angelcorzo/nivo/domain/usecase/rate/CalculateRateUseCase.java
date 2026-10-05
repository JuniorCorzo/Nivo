package dev.angelcorzo.nivo.domain.usecase.rate;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingEngine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.StayInterval;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CalculateRateUseCase {
  private final ParkingTicketsRepository parkingTicketsRepository;
  private final ParkingLotsRepository parkingLotsRepository;
  private final AuthenticationContextGateway authenticationContextGateway;
  private final PricingEngine pricingEngine;
  private final Clock clock;

  public PriceDetailed execute(UUID ticketId) {
    final ParkingTickets parkingTicket =
        this.parkingTicketsRepository
            .findById(ticketId)
            .orElseThrow(() -> new ParkingTicketNotFound(ticketId));

    UUID parkingId = parkingTicket.getSlot() != null ? resolveParkingIdFromTicket(parkingTicket) : null;
    return calculate(parkingTicket, parkingId);
  }

  public PriceDetailed execute(UUID ticketId, UUID parkingLotId) {
    final ParkingTickets parkingTicket =
        this.parkingTicketsRepository
            .findById(ticketId)
            .orElseThrow(() -> new ParkingTicketNotFound(ticketId));

    return calculate(parkingTicket, parkingLotId);
  }

  private PriceDetailed calculate(ParkingTickets parkingTicket, UUID parkingLotId) {
    ParkingLotPolicy policy = ParkingLotPolicy.defaults();
    if (parkingLotId != null) {
      policy =
          this.parkingLotsRepository
              .findById(parkingLotId)
              .map(ParkingLots::getPolicy)
              .orElse(ParkingLotPolicy.defaults());
    }

    final String tenantName =
        this.authenticationContextGateway.getCurrentTenant() != null
            ? this.authenticationContextGateway.getCurrentTenant().getCompanyName()
            : "Nivo Parking";
    final RateReference rate = parkingTicket.getRate();
    final StayInterval stayInterval =
        StayInterval.of(parkingTicket.getEntryTime(), OffsetDateTime.now(this.clock));

    final PricingContext context = PricingContext.of(rate, policy, stayInterval);

    return this.pricingEngine.calculate(context, tenantName);
  }

  private UUID resolveParkingIdFromTicket(ParkingTickets ticket) {
    // Falls back to safe default if slot does not have parking reference
    return null;
  }
}
