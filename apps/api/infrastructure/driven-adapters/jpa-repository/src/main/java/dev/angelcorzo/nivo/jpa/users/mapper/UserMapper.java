package dev.angelcorzo.nivo.jpa.users.mapper;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.users.UsersData;
import dev.angelcorzo.nivo.model.users.Users;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper for converting between {@link Users} domain entity and {@link UsersData} JPA
 * entity.
 *
 * <p>This interface extends {@link BaseMapper} to provide generic mapping methods and is configured
 * with {@link MapperStructConfig} for consistent behavior.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - Mapper)
 *
 * <p><strong>Responsibility:</strong> To facilitate data transfer between the domain and
 * persistence layers for Users.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see Users
 * @see UsersData
 * @see BaseMapper
 * @see MapperStructConfig
 */
@Mapper(config = MapperStructConfig.class)
public interface UserMapper extends BaseMapper<Users, UsersData> {}
