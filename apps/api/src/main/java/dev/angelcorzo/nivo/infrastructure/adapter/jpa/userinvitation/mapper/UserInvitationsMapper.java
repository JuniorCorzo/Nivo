package dev.angelcorzo.nivo.infrastructure.adapter.jpa.userinvitation.mapper;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.CoordinatesMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.userinvitation.UserInvitationsData;
import dev.angelcorzo.nivo.domain.model.userinvitations.UserInvitations;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper for converting between {@link UserInvitations} domain entity and {@link UserInvitationsData} JPA entity.
 *
 * <p>This interface extends {@link BaseMapper} to provide generic mapping methods
 * and is configured with {@link MapperStructConfig} for consistent behavior.</p>
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - Mapper)</p>
 * <p><strong>Responsibility:</strong> To facilitate data transfer between the domain and persistence layers for User Invitations.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see UserInvitations
 * @see UserInvitationsData
 * @see BaseMapper
 * @see MapperStructConfig
 */
@Mapper(config = MapperStructConfig.class, uses = CoordinatesMapper.class)
public interface UserInvitationsMapper extends BaseMapper<UserInvitations, UserInvitationsData> {}
