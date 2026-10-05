package dev.angelcorzo.nivo.infrastructure.adapter.jpa.transactions.mappers;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.JacksonConverter;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.payments.mapper.PaymentMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.transactions.TransactionsData;
import dev.angelcorzo.nivo.domain.model.transactions.Transactions;
import org.mapstruct.Mapper;

@Mapper(
    config = MapperStructConfig.class,
    uses = {JacksonConverter.class, PaymentMapper.class })
public interface TransactionMapper extends BaseMapper<Transactions, TransactionsData> {}
