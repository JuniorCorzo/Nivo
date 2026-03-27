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
public class InvitationNotFoundException extends RuntimeException {
  public InvitationNotFoundException() {
    super(ErrorMessagesModel.INVITATION_NOT_FOUND.toString());
  }
}
