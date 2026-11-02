package dev.angelcorzo.nivo.domain.model.slots.excetions;

/**
 * Standardized error message templates for Parking Slot domain operations.
 *
 * <p>
 * <strong>Layer:</strong> Domain (Slots)
 */
public enum SlotErrorMessages {
  SLOT_NOT_EXISTS("El slot con ID %s no está registrado");

  private final String template;

  SlotErrorMessages(String template) {
    this.template = template;
  }

  public String format(Object... values) {
    return String.format(template, values);
  }

  @Override
  public String toString() {
    return template;
  }
}
