package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.security.mapper;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.security.dto.AuthenticationResponseDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.security.dto.UserCredentialsDTO;
import dev.angelcorzo.nivo.domain.model.authentication.AuthResponse;
import dev.angelcorzo.nivo.domain.usecase.auth.LoginUseCase;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface AuthenticationMapper {
  LoginUseCase.UserCredentials toModel(UserCredentialsDTO dto);

  UserCredentialsDTO toDTO(LoginUseCase.UserCredentials model);

  AuthResponse toModel(AuthenticationResponseDTO dto);

  AuthenticationResponseDTO toDTO(AuthResponse model);
}
