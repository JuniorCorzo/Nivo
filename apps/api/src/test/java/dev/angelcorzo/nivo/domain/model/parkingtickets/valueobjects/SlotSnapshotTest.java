package dev.angelcorzo.nivo.domain.model.parkingtickets.valueobjects;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SlotSnapshotTest {

  @Test
  @DisplayName("Should create SlotSnapshot from Slots domain model")
  void shouldCreateSnapshotFromSlot() {
    UUID slotId = UUID.randomUUID();
    Slots slot =
        Slots.builder()
            .id(slotId)
            .slotNumber("042")
            .zone("A")
            .prefix("VIP")
            .type(SlotType.ELECTRIC_VEHICLE)
            .hasCharger(true)
            .isAccessible(true)
            .isActive(true)
            .build();

    SlotSnapshot snapshot = SlotSnapshot.from(slot);

    assertThat(snapshot.id()).isEqualTo(slotId);
    assertThat(snapshot.slotNumber()).isEqualTo("042");
    assertThat(snapshot.zone()).isEqualTo("A");
    assertThat(snapshot.prefix()).isEqualTo("VIP");
    assertThat(snapshot.type()).isEqualTo(SlotType.ELECTRIC_VEHICLE);
    assertThat(snapshot.hasCharger()).isTrue();
    assertThat(snapshot.isAccessible()).isTrue();
  }
}
