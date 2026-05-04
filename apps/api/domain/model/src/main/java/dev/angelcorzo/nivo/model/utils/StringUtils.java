package dev.angelcorzo.nivo.model.utils;

public final class StringUtils {

  private StringUtils() {
    throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
  }

  public static String sanitize(String value) {
    if (value == null) {
      return null;
    }

    return value.replace("\"", "").trim();
  }

  public static String normalize(String value) {
    return (value == null || value.isBlank()) ? null : value;
  }
}
