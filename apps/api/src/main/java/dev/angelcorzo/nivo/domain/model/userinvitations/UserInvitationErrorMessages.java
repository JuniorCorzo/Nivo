package dev.angelcorzo.nivo.domain.model.userinvitations;

/**
 * Standardized error message templates for User Invitation domain operations.
 *
 * <p>
 * <strong>Layer:</strong> Domain (Invitations)
 */
public enum UserInvitationErrorMessages {
  INVITATION_NOT_FOUND("Invitación no encontrada"),
  INVITATION_EXPIRED("La invitación expiró"),
  INVITATION_ALREADY_ACCEPTED("La invitación fue aceptada el %s");

  private final String template;

  UserInvitationErrorMessages(String template) {
    this.template = template;
  }

  public String format(Object... values) {
    return String.format(template, values);
  }

  @Override
  public String toString() {
    return template;
  }
}
