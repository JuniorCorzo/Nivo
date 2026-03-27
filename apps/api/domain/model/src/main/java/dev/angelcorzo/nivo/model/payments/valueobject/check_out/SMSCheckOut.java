package dev.angelcorzo.nivo.model.payments.valueobject.check_out;

import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import java.util.UUID;

import lombok.Builder;

@Builder
public record SMSCheckOut(
    UUID ticketId, UUID tenantId, PaymentsMethods paymentMethod, String mobilePhone)
    implements CheckOut {}
