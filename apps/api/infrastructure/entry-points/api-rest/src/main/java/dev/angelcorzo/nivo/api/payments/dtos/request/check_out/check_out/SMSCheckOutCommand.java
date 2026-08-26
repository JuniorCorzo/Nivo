package dev.angelcorzo.nivo.api.payments.dtos.request.check_out.check_out;

import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Builder;

@Builder
public record SMSCheckOutCommand(
    @NotNull UUID ticketId, @NotNull PaymentsMethods paymentMethod, @NotNull @NotEmpty String mobilePhone)
    implements CheckOutCommand {}
