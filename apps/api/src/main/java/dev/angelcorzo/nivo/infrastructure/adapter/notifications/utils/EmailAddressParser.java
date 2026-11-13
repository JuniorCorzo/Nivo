package dev.angelcorzo.nivo.infrastructure.adapter.notifications.utils;

public final class EmailAddressParser {

  private EmailAddressParser() {
    throw new UnsupportedOperationException("Utility class");
  }

  public record ParsedEmailAddress(String name, String email) {
  }

  /**
   * Parses an email string that may be formatted as plain email ("user@example.com") or RFC 822 format ("User Name
   * <user@example.com>", "User<user@example.com>", "\"User Name\" <user@example.com>").
   *
   * @param input
   *          Raw email address string
   * @return ParsedEmailAddress containing extracted name (or null) and sanitized email address
   */
  public static ParsedEmailAddress parse(final String input) {
    if (input == null || input.isBlank()) {
      return new ParsedEmailAddress(null, "");
    }

    final String trimmed = input.trim();
    if (trimmed.endsWith(">")) {
      final int openAngle = trimmed.indexOf('<');
      if (openAngle >= 0) {
        final String emailPart = trimmed.substring(openAngle + 1, trimmed.length() - 1).trim();
        if (emailPart.contains("@") && !emailPart.contains(" ") && !emailPart.contains("<")
          && !emailPart.contains(">")) {
          String namePart = trimmed.substring(0, openAngle).trim();
          if (namePart.startsWith("\"") && namePart.endsWith("\"") && namePart.length() >= 2) {
            namePart = namePart.substring(1, namePart.length() - 1).trim();
          }
          final String name = namePart.isEmpty() ? null : namePart;
          return new ParsedEmailAddress(name, emailPart);
        }
      }
    }

    return new ParsedEmailAddress(null, trimmed);
  }
}
