package dev.angelcorzo.nivo.model.userinvitations;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;

/**
 * Thrown when an operation is attempted on an invitation that cannot be found.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class InvitationNotFoundException extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "INVITATION_NOT_FOUND";

  public InvitationNotFoundException() {
    super(ErrorMessagesModel.INVITATION_NOT_FOUND.toString(), STATUS, CODE);
  }
}
