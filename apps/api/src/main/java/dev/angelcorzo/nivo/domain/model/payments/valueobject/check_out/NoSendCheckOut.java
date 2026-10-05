package dev.angelcorzo.nivo.domain.model.payments.valueobject.check_out;

import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentsMethods;
import java.util.UUID;

import lombok.Builder;

@Builder
public record NoSendCheckOut(UUID ticketId, UUID tenantId, PaymentsMethods paymentMethod)
    implements CheckOut {}
