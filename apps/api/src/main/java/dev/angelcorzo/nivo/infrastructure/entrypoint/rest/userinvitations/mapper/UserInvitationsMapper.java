package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.userinvitations.mapper;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.userinvitations.dto.InviteUserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.userinvitations.dto.UserInvitationsDTO;
import dev.angelcorzo.nivo.domain.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.domain.usecase.user.InviteUserWithRolUseCase;
import org.mapstruct.Mapper;

@Mapper(config =  MapperStructConfig.class)
public interface UserInvitationsMapper {
    InviteUserWithRolUseCase.InviteUserWithRole toModel(InviteUserDTO dto);
    UserInvitationsDTO toDTO(UserInvitations model);
}
