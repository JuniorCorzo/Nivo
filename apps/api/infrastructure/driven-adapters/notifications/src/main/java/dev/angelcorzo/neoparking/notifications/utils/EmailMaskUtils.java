package dev.angelcorzo.neoparking.notifications.utils;

public final class EmailMaskUtils {

  private EmailMaskUtils() {
    throw new UnsupportedOperationException("Utility class");
  }

  /**
   * Masks an email address for safe logging, preserving only the first character of the local part
   * and the full domain. e.g. "john.doe@example.com" → "j***@example.com"
   */
  public static String mask(String email) {
    if (email == null || email.isBlank()) {
      return "***";
    }

    final int atIndex = email.indexOf('@');
    if (atIndex <= 0 || atIndex == email.length() - 1) {
      return "***";
    }

    final String visiblePrefix = email.substring(0, 1);
    final String domain = email.substring(atIndex);
    return visiblePrefix + "***" + domain;
  }
}
