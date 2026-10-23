package dev.angelcorzo.nivo.infrastructure.adapter.notifications.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class EmailAddressParser {

  private static final Pattern RFC_822_PATTERN = Pattern
    .compile("^\\s*(?:\"?([^\"<>]*)\"?\\s*)?<\\s*([^<>@\\s]+@[^<>@\\s]+)\\s*>\\s*$");

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
    final Matcher matcher = RFC_822_PATTERN.matcher(trimmed);

    if (matcher.matches()) {
      String name = matcher.group(1);
      if (name != null) {
        name = name.trim();
        if (name.isEmpty()) {
          name = null;
        }
      }
      final String email = matcher.group(2).trim();
      return new ParsedEmailAddress(name, email);
    }

    return new ParsedEmailAddress(null, trimmed);
  }
}
