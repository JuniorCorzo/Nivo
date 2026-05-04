package dev.angelcorzo.nivo.model.tenants.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

/**
 * Thrown when a tenant has no user with the OWNER role assigned.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public class NoOwnerInTenantException extends AppException {
  private final static String ERROR_CODE = "NO_OWNER_IN_TENANT";
  private final static int STATUS = 400;

  public NoOwnerInTenantException(UUID tenantId) {
    super(ErrorMessagesModel.NO_OWNER_IN_TENANT.format(tenantId), STATUS, ERROR_CODE);
  }
}
