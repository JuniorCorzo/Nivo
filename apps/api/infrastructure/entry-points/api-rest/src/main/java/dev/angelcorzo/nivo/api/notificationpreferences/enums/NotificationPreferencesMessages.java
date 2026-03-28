package dev.angelcorzo.nivo.api.notificationpreferences.enums;

/**
 * Response messages for the Notification Preferences REST endpoints.
 *
 * <p><strong>Layer:</strong> Infrastructure (Entry Point - REST)
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public enum NotificationPreferencesMessages {
  NOTIFICATION_PREFERENCES_LIST("Preferencias de notificacion obtenidas con exito"),
  NOTIFICATION_PREFERENCES_TOGGLED("Preferencia de notificacion actualizada con exito"),
  ;

  private final String template;

  NotificationPreferencesMessages(String template) {
    this.template = template;
  }

  public String format(Object... args) {
    return String.format(this.template, args);
  }
}
