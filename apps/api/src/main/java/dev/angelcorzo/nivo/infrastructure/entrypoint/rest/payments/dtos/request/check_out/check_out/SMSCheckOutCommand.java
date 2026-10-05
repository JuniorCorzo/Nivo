package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.payments.dtos.request.check_out.check_out;

import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentsMethods;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Builder;

@Builder
public record SMSCheckOutCommand(
    @NotNull UUID ticketId, @NotNull PaymentsMethods paymentMethod, @NotNull @NotEmpty String mobilePhone)
    implements CheckOutCommand {}
