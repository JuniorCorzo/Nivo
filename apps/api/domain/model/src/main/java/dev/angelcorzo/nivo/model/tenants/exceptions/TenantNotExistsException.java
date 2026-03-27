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
public class TenantNotExistsException extends IllegalArgumentException {
  public TenantNotExistsException(UUID uuid) {
    super(ErrorMessagesModel.TENANT_NOT_EXISTS.format(uuid));
  }
}
