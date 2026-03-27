package dev.angelcorzo.nivo.api.payments.dtos.request.check_out.check_out;

import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import jakarta.validation.constraints.NotEmpty;
import java.util.UUID;
import lombok.Builder;

@Builder
public record EmailCheckOutCommand(
    @NotEmpty UUID ticketId, @NotEmpty PaymentsMethods paymentMethod, @NotEmpty String email)
    implements CheckOutCommand {}
