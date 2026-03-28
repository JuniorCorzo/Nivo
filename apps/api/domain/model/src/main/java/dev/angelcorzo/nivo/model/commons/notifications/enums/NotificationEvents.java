package dev.angelcorzo.nivo.model.commons.notifications.enums;

import lombok.Getter;

/**
 * Notification events emitted by the system.
 *
 * <p>Events marked as {@code transactional} are mandatory system notifications (e.g., invitation
 * emails, payment confirmations) that must be sent regardless of user preferences.
 * Non-transactional events respect the user's {@code notification_preferences} configuration.
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
@Getter
public enum NotificationEvents {
  RESERVATION_CREATED(false),
  TICKET_OPENED(false),
  TICKET_CLOSED(false),
  PAYMENT_COMPLETED(true),
  PAYMENT_CHECKOUT(true),
  USER_SELF_REGISTERED(false),
  USER_INVITED(true),
  USER_INVITATION_ACCEPTED(false),
  USER_ROLE_ASSIGNED(false);

  /**
   * -- GETTER -- Returns whether this event is transactional (mandatory, bypasses user
   * preferences).
   *
   * @return {@code true} if the notification must always be sent.
   */
  private final boolean transactional;

  NotificationEvents(boolean transactional) {
    this.transactional = transactional;
  }
}
