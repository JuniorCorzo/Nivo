package dev.angelcorzo.neoparking.jpa.users.mapper;

import dev.angelcorzo.neoparking.jpa.config.MapperStructConfig;
import dev.angelcorzo.neoparking.jpa.mappers.BaseMapper;
import dev.angelcorzo.neoparking.jpa.users.UsersData;
import dev.angelcorzo.neoparking.model.users.Users;
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
