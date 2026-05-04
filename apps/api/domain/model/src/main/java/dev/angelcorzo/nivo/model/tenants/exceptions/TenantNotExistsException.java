package dev.angelcorzo.nivo.model.tenants.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

/**
 * Thrown when an operation is attempted on a Tenant that does not exist.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class TenantNotExistsException extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "TENANT_NOT_FOUND";

  public TenantNotExistsException(UUID uuid) {
    super(ErrorMessagesModel.TENANT_NOT_EXISTS.format(uuid), STATUS, CODE);
  }
}
