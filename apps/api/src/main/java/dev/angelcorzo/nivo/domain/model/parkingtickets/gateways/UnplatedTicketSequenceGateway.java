package dev.angelcorzo.nivo.domain.model.parkingtickets.gateways;

import java.util.UUID;

public interface UnplatedTicketSequenceGateway {
    String nextTicketCode(final UUID parkingLotId);
}
