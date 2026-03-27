package dev.angelcorzo.nivo.usecase.acceptinvitation.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.time.OffsetDateTime;

/**
 * Thrown when an attempt is made to accept an invitation that has already been accepted.
 *
 * <p><strong>Layer:</strong> Application (Use Case)
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public class InvitationAlreadyAcceptedException extends RuntimeException {
  public InvitationAlreadyAcceptedException(OffsetDateTime acceptedAt) {
    super(ErrorMessagesModel.INVITATION_ALREADY_ACCEPTED.format(acceptedAt));
  }
}
