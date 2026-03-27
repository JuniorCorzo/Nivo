package dev.angelcorzo.nivo.api.payments.dtos.request.check_out.check_out;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "sendVia")
@JsonSubTypes({
    @JsonSubTypes.Type(value = EmailCheckOutCommand.class, name = "EMAIL"),
    @JsonSubTypes.Type(value = SMSCheckOutCommand.class, name = "SMS"),
    @JsonSubTypes.Type(value = NoSendCheckOutCommand.class, name = "URL"),
})
public sealed interface CheckOutCommand
    permits EmailCheckOutCommand, SMSCheckOutCommand, NoSendCheckOutCommand {
  UUID ticketId();
  PaymentsMethods paymentMethod();
}
