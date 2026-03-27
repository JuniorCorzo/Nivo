package dev.angelcorzo.nivo.api.users.enums;

public enum UserMessages {
  USER_INVITATION_ACCEPTED("Invitación aceptada con éxito"),
  USER_INVITATION_SEND("Invitación enviada con éxito"),
  USER_ROL_MODIFIED("El rol fue modificado con éxito"),
  USER_DEACTIVATED("El usuario fue desactivado con éxito");

  private final String template;

  UserMessages(String template) {
    this.template = template;
  }

  public String format(Object... args) {
    return String.format(template, args);
  }

  @Override
  public String toString() {
    return template;
  }
}
