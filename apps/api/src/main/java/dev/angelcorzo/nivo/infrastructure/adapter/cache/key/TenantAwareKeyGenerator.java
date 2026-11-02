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
 * Custom KeyGenerator enforcing tenant isolation in Redis keys.
 *
 * <p>
 * Prefixes all cache keys with `tenant:{tenantId}:` extracted from the active security context, preventing cross-tenant
 * data leakage at the storage key level.
 */
@Slf4j
@Component("tenantAwareKeyGenerator")
@RequiredArgsConstructor
public class TenantAwareKeyGenerator implements KeyGenerator {

  private final ObjectProvider<AuthenticationContextHolder> authContextProvider;

  @Override
  public Object generate(Object target, Method method, Object... params) {
    return buildKey(params);
  }

  public String buildKey(Object... params) {
    return buildKey(resolveTenantId(), params);
  }

  public String buildKey(UUID tenantId, Object... params) {
    final String prefix = tenantId != null ? "tenant:" + tenantId : "tenant:anonymous";
    final StringBuilder keyBuilder = new StringBuilder(prefix);
    for (Object param : params) {
      if (param != null) {
        keyBuilder.append(':').append(param);
      }
    }
    return keyBuilder.toString();
  }

  public UUID resolveTenantId() {
    try {
      final AuthenticationContextHolder holder = this.authContextProvider.getIfAvailable();
      if (holder != null) {
        return holder.getCurrentTenantId();
      }
    } catch (Exception e) {
      log.debug("No authenticated tenant context available: {}", e.getMessage());
    }
    return null;
  }
}
