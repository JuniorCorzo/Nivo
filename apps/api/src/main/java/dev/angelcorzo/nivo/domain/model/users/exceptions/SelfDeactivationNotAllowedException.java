package dev.angelcorzo.nivo.domain.model.users.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.domain.model.commons.exceptions.ErrorMessagesModel;

/**
 * Thrown when a user attempts to deactivate their own account.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public class SelfDeactivationNotAllowedException extends AppException {
  private static final int STATUS = 403;
  private static final String CODE = "SELF_DEACTIVATION_NOT_ALLOWED";

  public SelfDeactivationNotAllowedException() {
    super(ErrorMessagesModel.SELF_DEACTIVATION_NOT_ALLOWED.toString(), STATUS, CODE);
  }

  public SelfDeactivationNotAllowedException(final String message) {
    super(message, STATUS, CODE);
  }
}
