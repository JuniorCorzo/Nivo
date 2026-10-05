package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.mappers;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.CreatedUserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.DeactivateUserDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.ModifyRolDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.UserDTO;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.usecase.user.DeactivateUserUseCase;
import dev.angelcorzo.nivo.domain.usecase.user.ModifyUserRoleUseCase;
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
