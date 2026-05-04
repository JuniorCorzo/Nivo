package dev.angelcorzo.nivo.jpa.parkinglots.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.jpa.mappers.CoordinatesMapperJpaImpl;
import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotSummaryData;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig(
    classes = {
      ParkingLotsMapperJpaImpl.class,
      CoordinatesMapperJpaImpl.class,
      ParkingLotsMapperTest.TestConfig.class
    })
class ParkingLotsMapperTest {

  @Autowired private ParkingLotsMapper parkingLotsMapper;

  @Test
  @DisplayName("Should map summary data into enriched parking lot list item")
  void shouldMapSummaryDataToListItem() {
    Instant createdAt = Instant.parse("2026-04-18T10:15:30Z");
    Instant updatedAt = Instant.parse("2026-04-18T11:15:30Z");

    ParkingLotSummaryData summaryData =
        ParkingLotSummaryData.builder()
            .id(UUID.randomUUID())
            .name("Parking Norte")
            .currency("COP")
            .createdAt(createdAt)
            .updatedAt(updatedAt)
            .street("Calle 11")
            .city("Cúcuta")
            .state("Norte de Santander")
            .country("Colombia")
            .zipCode("540001")
            .latitude(7.8899)
            .longitude(-72.4967)
            .slotDistribution("[{\"type\":\"CAR\",\"count\":12},{\"type\":\"MOTORCYCLE\",\"count\":4}]")
            .ownerName("Juan Pérez")
            .totalCapacity(16L)
            .openTime("06:00:00-05:00")
            .closeTime("22:00:00-05:00")
            .build();

    var result = parkingLotsMapper.toListItem(summaryData);

    assertThat(result.id()).isEqualTo(summaryData.id());
    assertThat(result.name()).isEqualTo("Parking Norte");
    assertThat(result.currency()).isEqualTo("COP");
    assertThat(result.createdAt()).isEqualTo(OffsetDateTime.ofInstant(createdAt, ZoneOffset.UTC));
    assertThat(result.updatedAt()).isEqualTo(OffsetDateTime.ofInstant(updatedAt, ZoneOffset.UTC));
    assertThat(result.address().getStreet()).isEqualTo("Calle 11");
    assertThat(result.address().getCity()).isEqualTo("Cúcuta");
    assertThat(result.address().getState()).isEqualTo("Norte de Santander");
    assertThat(result.address().getCountry()).isEqualTo("Colombia");
    assertThat(result.address().getZipCode()).isEqualTo("540001");
    assertThat(result.coordinates().getLatitude()).isEqualTo(7.8899);
    assertThat(result.coordinates().getLongitude()).isEqualTo(-72.4967);
    assertThat(result.ownerName()).isEqualTo("Juan Pérez");
    assertThat(result.totalCapacity()).isEqualTo(16L);
    assertThat(result.slotDistribution()).hasSize(2);
    assertThat(result.slotDistribution().getFirst().type()).isEqualTo(SlotType.CAR);
    assertThat(result.slotDistribution().getFirst().count()).isEqualTo(12L);
    assertThat(result.slotDistribution().get(1).type()).isEqualTo(SlotType.MOTORCYCLE);
    assertThat(result.slotDistribution().get(1).count()).isEqualTo(4L);
    assertThat(result.operatingHours()).isNotNull();
    assertThat(result.operatingHours().getOpenTime().toString()).isEqualTo("06:00:00-05:00");
    assertThat(result.operatingHours().getCloseTime().toString()).isEqualTo("22:00:00-05:00");
  }

  @Configuration
  static class TestConfig {
    @Bean
    ObjectMapper objectMapper() {
      return new ObjectMapper();
    }
  }
}
