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
import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class InvitationAlreadyAcceptedException extends AppException {
  private static final int STATUS = 409;
  private static final String CODE = "INVITATION_ALREADY_ACCEPTED";

  public InvitationAlreadyAcceptedException(OffsetDateTime acceptedAt) {
    super(ErrorMessagesModel.INVITATION_ALREADY_ACCEPTED.format(acceptedAt), STATUS, CODE);
  }
}
