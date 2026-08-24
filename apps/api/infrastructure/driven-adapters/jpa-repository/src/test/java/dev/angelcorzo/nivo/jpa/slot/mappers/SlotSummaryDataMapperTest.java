package dev.angelcorzo.nivo.jpa.slot.mappers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.jpa.slot.SlotSummaryData;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.valueobject.SlotSummary;
import jakarta.persistence.Tuple;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SlotSummaryDataMapperTest {

  private final SlotSummaryDataMapper mapper = new SlotSummaryDataMapper();

  @Test
  @DisplayName("Should map tuple row into summary data including status")
  void shouldMapTupleRowToSummaryDataWithStatus() {
    UUID id = UUID.randomUUID();

    Tuple row = mock(Tuple.class);
    when(row.get("id", UUID.class)).thenReturn(id);
    when(row.get("parkingName", String.class)).thenReturn("Parking Central");
    when(row.get("type", SlotType.class)).thenReturn(SlotType.CAR);
    when(row.get("prefix", String.class)).thenReturn("P");
    when(row.get("zone", String.class)).thenReturn("A");
    when(row.get("numberSlot", String.class)).thenReturn("001");
    when(row.get("status", SlotStatus.class)).thenReturn(SlotStatus.AVAILABLE);
    when(row.get("hasTicket", Boolean.class)).thenReturn(false);
    when(row.get("hasHistory", Boolean.class)).thenReturn(false);

    SlotSummaryData result = mapper.toSummaryData(row);

    assertThat(result.id()).isEqualTo(id);
    assertThat(result.parkingName()).isEqualTo("Parking Central");
    assertThat(result.type()).isEqualTo(SlotType.CAR);
    assertThat(result.prefix()).isEqualTo("P");
    assertThat(result.zone()).isEqualTo("A");
    assertThat(result.numberSlot()).isEqualTo("001");
    assertThat(result.status()).isEqualTo(SlotStatus.AVAILABLE);
    assertThat(result.hasTicket()).isFalse();
    assertThat(result.hasHistory()).isFalse();
  }

  @Test
  @DisplayName("Should map tuple row with active ticket and history flags")
  void shouldMapTupleRowWithTicketAndHistoryFlags() {
    UUID id = UUID.randomUUID();

    Tuple row = mock(Tuple.class);
    when(row.get("id", UUID.class)).thenReturn(id);
    when(row.get("parkingName", String.class)).thenReturn("Parking Norte");
    when(row.get("type", SlotType.class)).thenReturn(SlotType.MOTORCYCLE);
    when(row.get("prefix", String.class)).thenReturn("M");
    when(row.get("zone", String.class)).thenReturn("B");
    when(row.get("numberSlot", String.class)).thenReturn("042");
    when(row.get("status", SlotStatus.class)).thenReturn(SlotStatus.OCCUPIED);
    when(row.get("hasTicket", Boolean.class)).thenReturn(true);
    when(row.get("hasHistory", Boolean.class)).thenReturn(true);

    SlotSummaryData result = mapper.toSummaryData(row);

    assertThat(result.hasTicket()).isTrue();
    assertThat(result.hasHistory()).isTrue();
    assertThat(result.status()).isEqualTo(SlotStatus.OCCUPIED);
  }

  @Test
  @DisplayName("Should map tuple row with history but no active ticket")
  void shouldMapTupleRowWithHistoryNoActiveTicket() {
    UUID id = UUID.randomUUID();

    Tuple row = mock(Tuple.class);
    when(row.get("id", UUID.class)).thenReturn(id);
    when(row.get("parkingName", String.class)).thenReturn("Parking Sur");
    when(row.get("type", SlotType.class)).thenReturn(SlotType.CAR);
    when(row.get("prefix", String.class)).thenReturn("S");
    when(row.get("zone", String.class)).thenReturn("C");
    when(row.get("numberSlot", String.class)).thenReturn("099");
    when(row.get("status", SlotStatus.class)).thenReturn(SlotStatus.AVAILABLE);
    when(row.get("hasTicket", Boolean.class)).thenReturn(false);
    when(row.get("hasHistory", Boolean.class)).thenReturn(true);

    SlotSummaryData result = mapper.toSummaryData(row);

    assertThat(result.hasTicket()).isFalse();
    assertThat(result.hasHistory()).isTrue();
  }

  @Test
  @DisplayName("Should map summary data into domain model including status")
  void shouldMapSummaryDataToDomainModelWithStatus() {
    UUID id = UUID.randomUUID();
    SlotSummaryData data = SlotSummaryData.builder()
        .id(id)
        .parkingName("Parking Central")
        .type(SlotType.CAR)
        .prefix("P")
        .zone("A")
        .numberSlot("001")
        .status(SlotStatus.OCCUPIED)
        .hasTicket(false)
        .hasHistory(false)
        .build();

    SlotSummary result = mapper.toModel(data);

    assertThat(result.id()).isEqualTo(id);
    assertThat(result.parkingName()).isEqualTo("Parking Central");
    assertThat(result.type()).isEqualTo(SlotType.CAR);
    assertThat(result.prefix()).isEqualTo("P");
    assertThat(result.zone()).isEqualTo("A");
    assertThat(result.numberSlot()).isEqualTo("001");
    assertThat(result.status()).isEqualTo(SlotStatus.OCCUPIED);
    assertThat(result.hasTicket()).isFalse();
    assertThat(result.hasHistory()).isFalse();
  }

  @Test
  @DisplayName("Should map summary data with ticket and history into domain model")
  void shouldMapSummaryDataWithTicketAndHistoryToDomainModel() {
    UUID id = UUID.randomUUID();
    SlotSummaryData data = SlotSummaryData.builder()
        .id(id)
        .parkingName("Parking Este")
        .type(SlotType.ELECTRIC_VEHICLE)
        .prefix("E")
        .zone("D")
        .numberSlot("007")
        .status(SlotStatus.OCCUPIED)
        .hasTicket(true)
        .hasHistory(true)
        .build();

    SlotSummary result = mapper.toModel(data);

    assertThat(result.hasTicket()).isTrue();
    assertThat(result.hasHistory()).isTrue();
    assertThat(result.status()).isEqualTo(SlotStatus.OCCUPIED);
  }
}
