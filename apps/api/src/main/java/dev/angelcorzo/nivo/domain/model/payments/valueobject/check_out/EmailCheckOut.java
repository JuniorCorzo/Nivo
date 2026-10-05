package dev.angelcorzo.nivo.domain.model.payments.valueobject.check_out;

import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentsMethods;
import lombok.Builder;

import java.util.UUID;

@Builder
public record EmailCheckOut(
		UUID ticketId,
		UUID tenantId,
		PaymentsMethods paymentMethod,
		String email
		) implements CheckOut {}
