package dev.angelcorzo.nivo.api.users.mappers;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.users.dto.CreatedUserDTO;
import dev.angelcorzo.nivo.api.users.dto.DeactivateUserDTO;
import dev.angelcorzo.nivo.api.users.dto.ModifyRolDTO;
import dev.angelcorzo.nivo.api.users.dto.UserDTO;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.usecase.deactivateuser.DeactivateUserUseCase;
import dev.angelcorzo.nivo.usecase.modifyuserrole.ModifyUserRoleUseCase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(config = MapperStructConfig.class)
public interface UserMapper {
  Users toModel(CreatedUserDTO createdUserDTO);

  ModifyUserRoleUseCase.ModifyUserRole toModel(ModifyRolDTO modifyRolDTO);

  @Mappings(@Mapping(target = "userIdToDeactivate", source = "userId"))
  DeactivateUserUseCase.DeactivateUserCommand toModel(DeactivateUserDTO dto);

  UserDTO toDTO(Users user);
}
