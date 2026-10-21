package dev.angelcorzo.nivo.domain.model.authentication.gateway;

import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.model.users.UserAuthentication;
import dev.angelcorzo.nivo.domain.model.users.Users;
import java.util.UUID;

public interface AuthenticationContextGateway {
  UserAuthentication getCurrentlyAuthenticatedUser();

  UUID getCurrentTenantId();

  UUID getCurrentUserId();

  Tenants getCurrentTenant();

  Users getCurrentUser();
}
