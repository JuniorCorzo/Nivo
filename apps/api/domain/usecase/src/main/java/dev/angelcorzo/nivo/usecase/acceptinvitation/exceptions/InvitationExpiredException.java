package dev.angelcorzo.nivo.usecase.acceptinvitation.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;

/**
 * Thrown when an attempt is made to accept an invitation that has passed its expiration date.
 *
 * <p><strong>Layer:</strong> Application (Use Case)
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public class InvitationExpiredException extends RuntimeException {
  public InvitationExpiredException() {
    super(ErrorMessagesModel.INVITATION_EXPIRED.toString());
  }
}
