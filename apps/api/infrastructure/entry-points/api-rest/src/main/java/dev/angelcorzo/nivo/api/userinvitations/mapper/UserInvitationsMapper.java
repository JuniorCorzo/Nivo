package dev.angelcorzo.nivo.api.userinvitations.mapper;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.userinvitations.dto.InviteUserDTO;
import dev.angelcorzo.nivo.api.userinvitations.dto.UserInvitationsDTO;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.usecase.inviteuserwithrol.InviteUserWithRolUseCase;
import org.mapstruct.Mapper;

@Mapper(config =  MapperStructConfig.class)
public interface UserInvitationsMapper {
    InviteUserWithRolUseCase.InviteUserWithRole toModel(InviteUserDTO dto);
    UserInvitationsDTO toDTO(UserInvitations model);
}
