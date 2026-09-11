package dev.angelcorzo.nivo.domain.model.slots.utils;

public final class SlotNumberUtils {

  private SlotNumberUtils() {
    throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
  }

  public static String recalculateSlotNumber(String oldSlotNumber, String oldPrefix, String newPrefix) {
    if (newPrefix == null || newPrefix.equals(oldPrefix)) {
      return oldSlotNumber;
    }
    if (oldSlotNumber == null) {
      return null;
    }
    if (oldPrefix != null && !oldPrefix.isEmpty()) {
      if (oldSlotNumber.startsWith(oldPrefix + "-")) {
        return newPrefix + "-" + oldSlotNumber.substring(oldPrefix.length() + 1);
      } else if (oldSlotNumber.startsWith(oldPrefix)) {
        return newPrefix + oldSlotNumber.substring(oldPrefix.length());
      }
    }
    return newPrefix + "-" + oldSlotNumber;
  }
}
