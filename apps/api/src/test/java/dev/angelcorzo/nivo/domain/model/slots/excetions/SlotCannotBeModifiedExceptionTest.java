package dev.angelcorzo.nivo.domain.model.slots.excetions;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SlotCannotBeModifiedExceptionTest {

  @Test
  @DisplayName("Should contain conflicting slot ids and message")
  void shouldContainConflictingSlotIds() {
    UUID id1 = UUID.randomUUID();
    UUID id2 = UUID.randomUUID();
    List<UUID> conflictingIds = List.of(id1, id2);

    SlotCannotBeModifiedException exception = new SlotCannotBeModifiedException(conflictingIds);

    assertThat(exception.getConflictingSlotIds()).containsExactly(id1, id2);
    assertThat(exception.getMessage()).contains(id1.toString(), id2.toString());
  }

  @Test
  @DisplayName("Should support custom message and conflicting slot ids")
  void shouldSupportCustomMessage() {
    UUID id = UUID.randomUUID();
    String customMessage = "Slot cannot be manually transitioned to OCCUPIED. Vehicle check-in is required.";

    SlotCannotBeModifiedException exception = new SlotCannotBeModifiedException(customMessage, List.of(id));

    assertThat(exception.getMessage()).isEqualTo(customMessage);
    assertThat(exception.getConflictingSlotIds()).containsExactly(id);
    assertThat(exception.getStatus()).isEqualTo(409);
    assertThat(exception.getCode()).isEqualTo("SLOT_CANNOT_BE_MODIFIED");
  }
}
