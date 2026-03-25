package dev.angelcorzo.neoparking.api.notificationlogs.enums;

public enum NotificationLogsMessages {
  NOTIFICATION_LOGS_LIST("Historial de notificaciones obtenido con exito"),
  ;

  private final String template;

  NotificationLogsMessages(String template) {
    this.template = template;
  }

  public String format(Object... args) {
    return String.format(this.template, args);
  }
}
