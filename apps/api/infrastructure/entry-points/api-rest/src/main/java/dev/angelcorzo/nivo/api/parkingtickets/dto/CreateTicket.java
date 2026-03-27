package dev.angelcorzo.nivo.api.parkingtickets.dto;

import java.util.UUID;
import lombok.Builder;

@Builder
public record CreateTicket(UUID slotId, UUID rateId, String email, String plate) {}
