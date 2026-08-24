package dev.angelcorzo.nivo.jpa.slot.mappers;

import dev.angelcorzo.nivo.jpa.slot.SlotSummaryData;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.valueobject.SlotSummary;
import jakarta.persistence.Tuple;
import java.util.UUID;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import org.springframework.stereotype.Component;

@Component
public class SlotSummaryDataMapper {

  public SlotSummaryData toSummaryData(Tuple row) {
    return SlotSummaryData.builder()
        .id(row.get("id", UUID.class))
        .parkingName(row.get("parkingName", String.class))
        .type(row.get("type", SlotType.class))
        .prefix(row.get("prefix", String.class))
        .zone(row.get("zone", String.class))
        .numberSlot(row.get("numberSlot", String.class))
        .status(row.get("status", SlotStatus.class))
        .hasTicket(Boolean.TRUE.equals(row.get("hasTicket", Boolean.class)))
        .hasHistory(Boolean.TRUE.equals(row.get("hasHistory", Boolean.class)))
        .build();
  }

  public SlotSummary toModel(SlotSummaryData data) {
    return new SlotSummary(
        data.id(),
        data.parkingName(),
        data.type(),
        data.prefix(),
        data.zone(),
        data.numberSlot(),
        data.status(),
        data.hasTicket(),
        data.hasHistory());
  }
}
