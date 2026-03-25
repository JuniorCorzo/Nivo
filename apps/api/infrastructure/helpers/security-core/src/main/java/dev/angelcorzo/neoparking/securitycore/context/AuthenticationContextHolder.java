package dev.angelcorzo.neoparking.securitycore.context;

import dev.angelcorzo.neoparking.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.neoparking.model.tenants.Tenants;
import dev.angelcorzo.neoparking.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.neoparking.model.users.UserAuthentication;
import dev.angelcorzo.neoparking.model.users.Users;
import dev.angelcorzo.neoparking.model.users.exceptions.UserAuthenticationContextInvalidException;
import dev.angelcorzo.neoparking.model.users.gateways.UsersRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RequiredArgsConstructor
public class AuthenticationContextHolder implements AuthenticationContextGateway {
  private final UsersRepository usersRepository;
  private final TenantsRepository tenantsRepository;

  @Override
  public UserAuthentication getCurrentlyAuthenticatedUser() {
    final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated())
      throw new UserAuthenticationContextInvalidException();

    final Object principal = authentication.getPrincipal();

    if (principal instanceof UserAuthentication userAuthentication) return userAuthentication;

    throw new UserAuthenticationContextInvalidException();
  }

  @Override
  public UUID getCurrentTenantId() {
    return this.getCurrentlyAuthenticatedUser().tenantId();
  }

  @Override
  public UUID getCurrentUserId() {
    return this.getCurrentlyAuthenticatedUser().userId();
  }

  @Override
  public Tenants getCurrentTenant() {
    return this.tenantsRepository.getReferenceById(this.getCurrentTenantId());
  }

  @Override
  public Users getCurrentUser() {
    return this.usersRepository.getReferenceById(this.getCurrentUserId());
  }
}
