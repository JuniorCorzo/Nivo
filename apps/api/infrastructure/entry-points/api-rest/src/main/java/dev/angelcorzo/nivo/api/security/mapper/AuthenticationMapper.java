package dev.angelcorzo.nivo.api.security.mapper;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.security.dto.AuthenticationResponseDTO;
import dev.angelcorzo.nivo.api.security.dto.UserCredentialsDTO;
import dev.angelcorzo.nivo.model.authentication.AuthResponse;
import dev.angelcorzo.nivo.usecase.login.LoginUseCase;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface AuthenticationMapper {
  LoginUseCase.UserCredentials toModel(UserCredentialsDTO dto);

  UserCredentialsDTO toDTO(LoginUseCase.UserCredentials model);

  AuthResponse toModel(AuthenticationResponseDTO dto);

  AuthenticationResponseDTO toDTO(AuthResponse model);
}
