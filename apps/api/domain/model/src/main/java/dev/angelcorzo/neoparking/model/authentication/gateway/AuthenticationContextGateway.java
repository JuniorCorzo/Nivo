package dev.angelcorzo.neoparking.model.authentication.gateway;

import dev.angelcorzo.neoparking.model.tenants.Tenants;
import dev.angelcorzo.neoparking.model.users.UserAuthentication;
import dev.angelcorzo.neoparking.model.users.Users;
import java.util.UUID;

public interface AuthenticationContextGateway {
  UserAuthentication getCurrentlyAuthenticatedUser();

  UUID getCurrentTenantId();

  UUID getCurrentUserId();

  Tenants getCurrentTenant();

  Users getCurrentUser();
}
