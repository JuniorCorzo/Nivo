package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.CoordinatesMapperJpaImpl;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.ParkingLotSummaryData;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.ParkingLotsData;
import java.math.BigDecimal;
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
            .gracePeriodMinutes(15)
            .gracePeriodPrice(new BigDecimal("5000.00"))
            .ivaRate(new BigDecimal("0.1900"))
            .build();

    final ParkingLotListItem result = parkingLotsMapper.toListItem(summaryData);

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
    assertThat(result.operatingHours().getOpenTime()).isEqualTo(java.time.OffsetTime.of(6, 0, 0, 0, ZoneOffset.ofHours(-5)));
    assertThat(result.operatingHours().getCloseTime()).isEqualTo(java.time.OffsetTime.of(22, 0, 0, 0, ZoneOffset.ofHours(-5)));
    assertThat(result.policy()).isNotNull();
    assertThat(result.policy().gracePeriodMinutes()).isEqualTo(15);
    assertThat(result.policy().gracePeriodPrice()).isEqualByComparingTo(new BigDecimal("5000.00"));
    assertThat(result.policy().ivaRate()).isEqualByComparingTo(new BigDecimal("0.1900"));
  }

  @Test
  @DisplayName("Should map ParkingLotsData to ParkingLots domain entity including policy")
  void shouldMapDataToEntityWithPolicy() {
    ParkingLotsData data =
        ParkingLotsData.builder()
            .id(UUID.randomUUID())
            .name("Parking Central")
            .gracePeriodMinutes(15)
            .gracePeriodPrice(new BigDecimal("2000.00"))
            .ivaRate(new BigDecimal("0.1900"))
            .build();

    ParkingLots entity = parkingLotsMapper.toEntity(data);

    assertThat(entity).isNotNull();
    assertThat(entity.getId()).isEqualTo(data.getId());
    assertThat(entity.getName()).isEqualTo("Parking Central");
    assertThat(entity.getPolicy()).isNotNull();
    assertThat(entity.getPolicy().gracePeriodMinutes()).isEqualTo(15);
    assertThat(entity.getPolicy().gracePeriodPrice()).isEqualByComparingTo(new BigDecimal("2000.00"));
    assertThat(entity.getPolicy().ivaRate()).isEqualByComparingTo(new BigDecimal("0.1900"));
  }

  @Test
  @DisplayName("Should fallback to default policy when ParkingLotsData has null policy fields")
  void shouldMapDataToEntityWithNullPolicyFieldsUsingDefaults() {
    ParkingLotsData data =
        ParkingLotsData.builder()
            .id(UUID.randomUUID())
            .name("Parking Central")
            .gracePeriodMinutes(null)
            .gracePeriodPrice(null)
            .ivaRate(null)
            .build();

    ParkingLots entity = parkingLotsMapper.toEntity(data);

    assertThat(entity).isNotNull();
    assertThat(entity.getPolicy()).isNotNull();
    assertThat(entity.getPolicy().gracePeriodMinutes()).isZero();
    assertThat(entity.getPolicy().gracePeriodPrice()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(entity.getPolicy().ivaRate()).isEqualByComparingTo(new BigDecimal("0.19"));
  }

  @Test
  @DisplayName("Should map ParkingLots domain entity to ParkingLotsData including policy fields")
  void shouldMapEntityToDataWithPolicy() {
    ParkingLotPolicy policy =
        ParkingLotPolicy.builder()
            .gracePeriodMinutes(20)
            .gracePeriodPrice(new BigDecimal("1500.00"))
            .ivaRate(new BigDecimal("0.1900"))
            .build();

    ParkingLots entity =
        ParkingLots.builder()
            .id(UUID.randomUUID())
            .name("Parking Express")
            .policy(policy)
            .build();

    ParkingLotsData data = parkingLotsMapper.toData(entity);

    assertThat(data).isNotNull();
    assertThat(data.getId()).isEqualTo(entity.getId());
    assertThat(data.getName()).isEqualTo("Parking Express");
    assertThat(data.getGracePeriodMinutes()).isEqualTo(20);
    assertThat(data.getGracePeriodPrice()).isEqualByComparingTo(new BigDecimal("1500.00"));
    assertThat(data.getIvaRate()).isEqualByComparingTo(new BigDecimal("0.1900"));
  }

  @Configuration
  static class TestConfig {
    @Bean
    ObjectMapper objectMapper() {
      return new ObjectMapper();
    }
  }
}
