package dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import dev.angelcorzo.nivo.domain.usecase.slot.EditSlotUseCase;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.CoordinatesMapperJpaImpl;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.ParkingLotsData;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers.SlotSummaryDataMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers.SlotsMappersJpaImpl;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.users.UsersData;
import dev.angelcorzo.nivo.domain.model.commons.encryption.gateways.EncryptionGateway;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@ActiveProfiles("test")
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnableJpaRepositories(basePackageClasses = SlotsRepositoryData.class)
@Import({
  SlotsRepositoryAdapter.class,
  SlotsMappersJpaImpl.class,
  SlotSummaryDataMapper.class,
  CoordinatesMapperJpaImpl.class
})
@DisplayName("SlotsRepositoryPersistenceIntegrationTest")
class SlotsRepositoryPersistenceIntegrationTest {

  @MockitoBean private EncryptionGateway encryptionGateway;
  @Autowired private EntityManager entityManager;
  @Autowired private SlotsRepositoryAdapter slotsRepositoryAdapter;

  private EditSlotUseCase editSlotUseCase;
  private ParkingLotsData testParkingLot;
  private TenantsData testTenant;

  @BeforeEach
  void setUp() {
    this.editSlotUseCase = new EditSlotUseCase(slotsRepositoryAdapter);

    this.testTenant =
        TenantsData.builder()
            .companyName("Nivo Test Tenant")
            .build();
    entityManager.persist(testTenant);
    entityManager.flush();

    UsersData testOwner =
        UsersData.builder()
            .fullName("Slot Owner")
            .email("owner-" + UUID.randomUUID() + "@test.com")
            .password("secretHash")
            .role(Roles.MANAGER)
            .tenant(testTenant)
            .build();
    entityManager.persist(testOwner);
    entityManager.flush();

    this.testParkingLot =
        ParkingLotsData.builder()
            .name("Main Lot")
            .owner(testOwner)
            .tenant(testTenant)
            .gracePeriodMinutes(0)
            .gracePeriodPrice(BigDecimal.ZERO)
            .ivaRate(BigDecimal.valueOf(0.19))
            .build();
    entityManager.persist(testParkingLot);
    entityManager.flush();
  }

  @Test
  @DisplayName("Should persist slot update to database when executed via EditSlotUseCase")
  void shouldPersistSlotUpdateToDatabaseViaUseCase() {
    SlotsData initialSlot =
        SlotsData.builder()
            .parking(testParkingLot)
            .tenant(testTenant)
            .slotNumber("A-01")
            .zone("A")
            .prefix("A")
            .type(SlotType.CAR)
            .status(SlotStatus.AVAILABLE)
            .hasCharger(false)
            .isAccessible(false)
            .isActive(true)
            .build();
    entityManager.persist(initialSlot);
    entityManager.flush();
    UUID slotId = initialSlot.getId();

    // Clear entityManager cache to ensure find comes from DB
    entityManager.clear();

    EditSlotUseCase.UpdateSlotCommand command =
        new EditSlotUseCase.UpdateSlotCommand(slotId, "A-01-UPDATED", SlotType.ELECTRIC_VEHICLE, SlotStatus.MAINTENANCE);

    Slots updatedSlot = editSlotUseCase.execute(command);

    assertThat(updatedSlot).isNotNull();
    assertThat(updatedSlot.getId()).isEqualTo(slotId);
    assertThat(updatedSlot.getSlotNumber()).isEqualTo("A-01-UPDATED");
    assertThat(updatedSlot.getType()).isEqualTo(SlotType.ELECTRIC_VEHICLE);
    assertThat(updatedSlot.getStatus()).isEqualTo(SlotStatus.MAINTENANCE);

    // Flush and clear persistence context to force reading fresh state from database
    entityManager.flush();
    entityManager.clear();

    SlotsData persistedData = entityManager.find(SlotsData.class, slotId);
    assertThat(persistedData).isNotNull();
    assertThat(persistedData.getSlotNumber()).isEqualTo("A-01-UPDATED");
    assertThat(persistedData.getType()).isEqualTo(SlotType.ELECTRIC_VEHICLE);
    assertThat(persistedData.getStatus()).isEqualTo(SlotStatus.MAINTENANCE);

    // Also verify via repository adapter findById
    Optional<Slots> persistedDomain = slotsRepositoryAdapter.findById(slotId);
    assertThat(persistedDomain).isPresent();
    assertThat(persistedDomain.get().getSlotNumber()).isEqualTo("A-01-UPDATED");
    assertThat(persistedDomain.get().getType()).isEqualTo(SlotType.ELECTRIC_VEHICLE);
    assertThat(persistedDomain.get().getStatus()).isEqualTo(SlotStatus.MAINTENANCE);
  }

  @Test
  @DisplayName("Should persist slot update directly through SlotsRepositoryAdapter.save()")
  void shouldPersistSlotUpdateDirectlyThroughAdapter() {
    SlotsData initialSlot =
        SlotsData.builder()
            .parking(testParkingLot)
            .tenant(testTenant)
            .slotNumber("B-01")
            .zone("B")
            .prefix("B")
            .type(SlotType.MOTORCYCLE)
            .status(SlotStatus.MAINTENANCE)
            .hasCharger(false)
            .isAccessible(false)
            .isActive(true)
            .build();
    entityManager.persist(initialSlot);
    entityManager.flush();
    UUID slotId = initialSlot.getId();

    entityManager.clear();

    Slots domainSlot = slotsRepositoryAdapter.findById(slotId).orElseThrow();
    Slots modifiedSlot = domainSlot.toBuilder()
        .status(SlotStatus.AVAILABLE)
        .slotNumber("B-01-RENAMED")
        .type(SlotType.BIKE)
        .build();

    Slots saved = slotsRepositoryAdapter.save(modifiedSlot);
    assertThat(saved.getStatus()).isEqualTo(SlotStatus.AVAILABLE);
    assertThat(saved.getSlotNumber()).isEqualTo("B-01-RENAMED");
    assertThat(saved.getType()).isEqualTo(SlotType.BIKE);

    entityManager.flush();
    entityManager.clear();

    SlotsData freshData = entityManager.find(SlotsData.class, slotId);
    assertThat(freshData).isNotNull();
    assertThat(freshData.getStatus()).isEqualTo(SlotStatus.AVAILABLE);
    assertThat(freshData.getSlotNumber()).isEqualTo("B-01-RENAMED");
    assertThat(freshData.getType()).isEqualTo(SlotType.BIKE);
  }
}
