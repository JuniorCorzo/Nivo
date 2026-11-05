package dev.angelcorzo.nivo.infrastructure.adapter.cache.key;

import dev.angelcorzo.nivo.domain.model.users.exceptions.UserAuthenticationContextInvalidException;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.exceptions.MissingTenantCacheContextException;
import dev.angelcorzo.nivo.infrastructure.security.context.AuthenticationContextHolder;
import java.lang.reflect.Method;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.stereotype.Component;

/**
 * Key generator managing both tenant-scoped and public-scoped Redis keys.
 *
 * <p>
 * Enforces strict multi-tenant isolation by prefixing tenant-scoped keys with {@code tenant:{tenantId}:}. Throws
 * {@link MissingTenantCacheContextException} when tenant context is missing to prevent cache poisoning. Public keys use
 * {@code public:} prefix.
 */
@Slf4j
@Component("cacheKeyGenerator")
@RequiredArgsConstructor
public class CacheKeyGenerator implements KeyGenerator {

  private static final String TENANT_PREFIX = "tenant:";
  private static final String PUBLIC_PREFIX = "public:";

  private final ObjectProvider<AuthenticationContextHolder> authContextProvider;

  @Override
  public Object generate(final Object target, final Method method, final Object... params) {
    return buildTenantKey(params);
  }

  public String buildKey(final Object... params) {
    return buildTenantKey(params);
  }

  public String buildTenantKey(final Object... params) {
    return buildKeyForTenant(resolveRequiredTenantId(), params);
  }

  public String buildKeyForTenant(final UUID tenantId, final Object... params) {
    if (tenantId == null) {
      throw new MissingTenantCacheContextException(
        "Cannot generate tenant-scoped cache key without an authenticated tenantId");
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
      throw new MissingTenantCacheContextException(
        "Active security context does not contain an authenticated tenant ID for cache key generation");
    }
    return tenantId;
  }

  public UUID resolveTenantId() {
    final AuthenticationContextHolder holder = this.authContextProvider.getIfAvailable();
    if (holder == null) {
      return null;
    }
    try {
      return holder.getCurrentTenantId();
    } catch (final UserAuthenticationContextInvalidException e) {
      log.debug("No authenticated tenant context available: {}", e.getMessage());
      return null;
    }
  }
}
