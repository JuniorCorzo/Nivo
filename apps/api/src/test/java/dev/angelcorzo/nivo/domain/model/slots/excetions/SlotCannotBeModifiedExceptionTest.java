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
}
