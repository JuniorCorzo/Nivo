package dev.angelcorzo.nivo.api.parkingtickets.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.api.commons.TimezoneConverter;
import dev.angelcorzo.nivo.api.parkingtickets.dto.ParkingTicketsDTO;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig(classes = {ParkingTicketMapperRestImpl.class, TimezoneConverter.class})
class ParkingTicketMapperTest {

  @Autowired private ParkingTicketMapper mapper;

  @Test
  void toDtoConvertsDatesToBogotaTimezone() {
    OffsetDateTime utc = OffsetDateTime.of(2025, 5, 3, 0, 20, 37, 0, ZoneOffset.UTC);
    ParkingTickets model =
        ParkingTickets.builder()
            .entryTime(utc)
            .exitTime(utc)
            .createdAt(utc)
            .updatedAt(utc)
            .deletedAt(utc)
            .build();

    ParkingTicketsDTO dto = mapper.toDto(model);

    ZoneId bogota = ZoneId.of("America/Bogota");
    assertThat(dto.entryTime().getZone()).isEqualTo(bogota);
    assertThat(dto.entryTime().getHour()).isEqualTo(19);
    assertThat(dto.createdAt().getZone()).isEqualTo(bogota);
    assertThat(dto.createdAt().getDayOfMonth()).isEqualTo(2);
  }

  @Test
  void toDtoHandlesNullDates() {
    ParkingTickets model = ParkingTickets.builder().build();
    ParkingTicketsDTO dto = mapper.toDto(model);

    assertThat(dto.entryTime()).isNull();
    assertThat(dto.createdAt()).isNull();
  }
}
