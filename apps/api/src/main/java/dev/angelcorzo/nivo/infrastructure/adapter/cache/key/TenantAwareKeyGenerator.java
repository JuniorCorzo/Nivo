package dev.angelcorzo.nivo.infrastructure.adapter.cache.key;

import dev.angelcorzo.nivo.infrastructure.security.context.AuthenticationContextHolder;
import java.lang.reflect.Method;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.stereotype.Component;

/**
 * Custom KeyGenerator enforcing strict tenant isolation in Redis keys.
 *
 * <p>
 * Prefixes all tenant-scoped cache keys with {@code tenant:{tenantId}:} extracted from the active security context.
 * Throws {@link IllegalStateException} if no authenticated tenant is present, preventing cache poisoning and
 * cross-tenant data leakage.
 */
@Slf4j
@Component("tenantAwareKeyGenerator")
@RequiredArgsConstructor
public class TenantAwareKeyGenerator implements KeyGenerator {

  private static final String TENANT_PREFIX = "tenant:";
  private static final String PUBLIC_PREFIX = "public:";

  private final ObjectProvider<AuthenticationContextHolder> authContextProvider;

  @Override
  public Object generate(final Object target, final Method method, final Object... params) {
    return buildKey(params);
  }

  public String buildKey(final Object... params) {
    return buildKeyForTenant(resolveRequiredTenantId(), params);
  }

  public String buildKeyForTenant(final UUID tenantId, final Object... params) {
    if (tenantId == null) {
      throw new IllegalStateException("Cannot generate tenant-scoped cache key without an authenticated tenantId");
    }

    final StringBuilder keyBuilder = new StringBuilder(TENANT_PREFIX).append(tenantId);
    for (final Object param : params) {
      if (param != null) {
        keyBuilder.append(':').append(param);
      }
    }
    return keyBuilder.toString();
  }

  public static String buildPublicKey(final Object... params) {
    final StringBuilder keyBuilder = new StringBuilder(PUBLIC_PREFIX);
    for (int i = 0; i < params.length; i++) {
      if (params[i] != null) {
        if (i > 0) {
          keyBuilder.append(':');
        }
        keyBuilder.append(params[i]);
      }
    }
    return keyBuilder.toString();
  }

  public UUID resolveRequiredTenantId() {
    final UUID tenantId = resolveTenantId();
    if (tenantId == null) {
      throw new IllegalStateException(
        "Active security context does not contain an authenticated tenant ID for cache key generation");
    }
    return tenantId;
  }

  public UUID resolveTenantId() {
    try {
      final AuthenticationContextHolder holder = this.authContextProvider.getIfAvailable();
      if (holder != null) {
        return holder.getCurrentTenantId();
      }
    } catch (final Exception e) {
      log.debug("No authenticated tenant context available: {}", e.getMessage());
    }
    return null;
  }
}
