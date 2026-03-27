package dev.angelcorzo.nivo.model.payments.valueobject.check_out;

import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import lombok.Builder;

import java.util.UUID;

@Builder
public record EmailCheckOut(
		UUID ticketId,
		UUID tenantId,
		PaymentsMethods paymentMethod,
		String email
		) implements CheckOut {}
