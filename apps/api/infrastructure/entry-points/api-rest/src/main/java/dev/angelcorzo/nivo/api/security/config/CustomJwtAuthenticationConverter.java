package dev.angelcorzo.nivo.api.security.config;

import dev.angelcorzo.nivo.model.authentication.exceptions.TokenInvalidException;
import dev.angelcorzo.nivo.model.commons.exceptions.TokenErrorMessages;
import dev.angelcorzo.nivo.model.users.UserAuthentication;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.usecase.validatetoken.ValidateAccessTokenUseCase;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class CustomJwtAuthenticationConverter
    implements Converter<Jwt, AbstractAuthenticationToken> {

  private final ValidateAccessTokenUseCase validateAccessTokenUseCase;

  @Override
  public AbstractAuthenticationToken convert(Jwt source) {
    log.debug("Converting JWT to Authentication");
    validateAccessTokenUseCase.validate(source.getTokenValue());
    final String userId = source.getSubject();
    final String tenantId = source.getClaimAsString("tenantId");
    final String role = source.getClaimAsString("role");

    if (userId == null || tenantId == null || role == null)
      throw new TokenInvalidException(TokenErrorMessages.INVALID_TOKEN.toString());

    List<SimpleGrantedAuthority> authority =
        Collections.singletonList(new SimpleGrantedAuthority(role));

    final UserAuthentication userPrincipal =
        UserAuthentication.builder()
            .userId(UUID.fromString(userId))
            .tenantId(UUID.fromString(tenantId))
            .role(Roles.valueOf(Roles.class, role.replace("ROLE_", "").toUpperCase()))
            .build();

    UsernamePasswordAuthenticationToken authenticationToken =
        new UsernamePasswordAuthenticationToken(userPrincipal, source, authority);

    log.debug("Converted JWT to Authentication: {}", authenticationToken);
    return authenticationToken;
  }
}
