package dev.angelcorzo.nivo.jpa.tenants.mappers;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.mappers.CoordinatesMapper;
import dev.angelcorzo.nivo.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.jpa.users.UsersData;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.users.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for converting between {@link Tenants} domain entity and {@link TenantsData} JPA
 * entity.
 *
 * <p>This interface extends {@link BaseMapper} to provide generic mapping methods and is configured
 * with {@link MapperStructConfig} for consistent behavior.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - Mapper)
 *
 * <p><strong>Responsibility:</strong> To facilitate data transfer between the domain and
 * persistence layers for Tenants.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see Tenants
 * @see TenantsData
 * @see BaseMapper
 * @see MapperStructConfig
 */
@Mapper(config = MapperStructConfig.class, uses = CoordinatesMapper.class)
public interface TenantsMapper extends BaseMapper<Tenants, TenantsData> {

  @Override
  @Mapping(target = "users", source = "users")
  Tenants toEntity(TenantsData data);

  @Mapping(target = "tenant", ignore = true)
  Users toUser(UsersData user);
}
