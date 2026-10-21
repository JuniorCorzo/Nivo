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

    String safeOldPrefix = oldPrefix == null ? "" : oldPrefix;
    String safeNewPrefix = newPrefix;

    if (safeOldPrefix.equals(safeNewPrefix)) {
      return oldSlotNumber;
    }

    if (safeOldPrefix.isEmpty()) {
      return safeNewPrefix.isEmpty() ? oldSlotNumber : safeNewPrefix + "-" + oldSlotNumber;
    }

    if (oldSlotNumber.startsWith(safeOldPrefix + "-")) {
      String numberPart = oldSlotNumber.substring(safeOldPrefix.length() + 1);
      return safeNewPrefix.isEmpty() ? numberPart : safeNewPrefix + "-" + numberPart;
    } else if (oldSlotNumber.startsWith(safeOldPrefix)) {
      String numberPart = oldSlotNumber.substring(safeOldPrefix.length());
      return safeNewPrefix.isEmpty() ? numberPart : safeNewPrefix + numberPart;
    }

    return safeNewPrefix.isEmpty() ? oldSlotNumber : safeNewPrefix + "-" + oldSlotNumber;
  }
}
