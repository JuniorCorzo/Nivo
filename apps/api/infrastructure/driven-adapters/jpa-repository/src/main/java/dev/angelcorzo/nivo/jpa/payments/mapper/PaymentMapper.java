package dev.angelcorzo.nivo.jpa.payments.mapper;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.mappers.JacksonConverter;
import dev.angelcorzo.nivo.jpa.payments.PaymentsData;
import dev.angelcorzo.nivo.model.payments.Payments;
import org.mapstruct.Mapper;

@Mapper(
    config = MapperStructConfig.class,
    uses = {JacksonConverter.class})
public interface PaymentMapper extends BaseMapper<Payments, PaymentsData> {
  @Override
  Payments toEntity(PaymentsData data);

  @Override
  PaymentsData toData(Payments entity);
}
