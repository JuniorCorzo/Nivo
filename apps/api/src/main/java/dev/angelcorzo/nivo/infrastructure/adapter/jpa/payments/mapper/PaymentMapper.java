package dev.angelcorzo.nivo.infrastructure.adapter.jpa.payments.mapper;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.JacksonConverter;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.payments.PaymentsData;
import dev.angelcorzo.nivo.domain.model.payments.Payments;
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
