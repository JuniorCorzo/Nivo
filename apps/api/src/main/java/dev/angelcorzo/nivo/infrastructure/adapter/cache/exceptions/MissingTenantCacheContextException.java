package dev.angelcorzo.nivo.infrastructure.adapter.cache.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

/**
 * Exception thrown when a tenant-scoped cache operation is attempted without an authenticated tenant context.
 */
public class MissingTenantCacheContextException extends AppException {

  private static final int STATUS = 401;
  private static final String CODE = "CACHE_TENANT_CONTEXT_MISSING";

  public MissingTenantCacheContextException() {
    super("Active security context does not contain an authenticated tenant ID for cache key generation", STATUS, CODE);
  }

  public MissingTenantCacheContextException(final String message) {
    super(message, STATUS, CODE);
  }
}
