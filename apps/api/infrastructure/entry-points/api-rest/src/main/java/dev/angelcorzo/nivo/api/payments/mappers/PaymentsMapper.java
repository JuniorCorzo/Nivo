package dev.angelcorzo.nivo.api.payments.mappers;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.payments.dtos.request.check_out.check_out.CheckOutCommand;
import dev.angelcorzo.nivo.api.payments.dtos.request.check_out.check_out.EmailCheckOutCommand;
import dev.angelcorzo.nivo.api.payments.dtos.request.check_out.check_out.NoSendCheckOutCommand;
import dev.angelcorzo.nivo.api.payments.dtos.request.check_out.check_out.SMSCheckOutCommand;
import dev.angelcorzo.nivo.api.payments.dtos.response.PaymentsDTO;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.EmailCheckOut;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.NoSendCheckOut;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.SMSCheckOut;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.SubclassMapping;
import org.mapstruct.SubclassMappings;

@Mapper(config = MapperStructConfig.class)
public interface PaymentsMapper {
  @SubclassMappings({
    @SubclassMapping(source = EmailCheckOutCommand.class, target = EmailCheckOut.class),
    @SubclassMapping(source = SMSCheckOutCommand.class, target = SMSCheckOut.class),
    @SubclassMapping(source = NoSendCheckOutCommand.class, target = NoSendCheckOut.class),
  })
  CheckOut toModel(CheckOutCommand command);

  @InheritConfiguration(name = "toModel")
  EmailCheckOut toEmailModel(EmailCheckOutCommand emailCheckOut);

  @InheritConfiguration(name = "toModel")
  SMSCheckOut toSMSModel(SMSCheckOutCommand emailCheckOut);

  @InheritConfiguration(name = "toModel")
  NoSendCheckOut toUrlModel(NoSendCheckOutCommand emailCheckOut);

  @Mapping(target = "tenantId", source = "tenant.id")
  @Mapping(target = "userId", source = "user.id")
  @Mapping(target = "parkingTicketId", source = "parkingTicket.id")
  PaymentsDTO toDto(Payments payments);
}
