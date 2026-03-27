package dev.angelcorzo.nivo.model.authentication.gateway;

import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.users.UserAuthentication;
import dev.angelcorzo.nivo.model.users.Users;
import java.util.UUID;

public interface AuthenticationContextGateway {
  UserAuthentication getCurrentlyAuthenticatedUser();

  UUID getCurrentTenantId();

  UUID getCurrentUserId();

  Tenants getCurrentTenant();

  Users getCurrentUser();
}
