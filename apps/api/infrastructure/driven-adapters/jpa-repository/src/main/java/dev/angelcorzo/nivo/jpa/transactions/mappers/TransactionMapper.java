package dev.angelcorzo.nivo.jpa.transactions.mappers;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.mappers.JacksonConverter;
import dev.angelcorzo.nivo.jpa.payments.mapper.PaymentMapper;
import dev.angelcorzo.nivo.jpa.transactions.TransactionsData;
import dev.angelcorzo.nivo.model.transactions.Transactions;
import org.mapstruct.Mapper;

@Mapper(
    config = MapperStructConfig.class,
    uses = {JacksonConverter.class, PaymentMapper.class })
public interface TransactionMapper extends BaseMapper<Transactions, TransactionsData> {}
