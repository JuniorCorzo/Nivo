package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.commons.encryption.gateways.EncryptionGateway;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.DailySummaryViewRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.HourlyOccupancyViewRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.OperationalReportViewRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@ActiveProfiles("test")
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnableJpaRepositories(basePackages = "dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository")
class DashboardViewsRepositoryTest {

  @MockitoBean
  private EncryptionGateway encryptionGateway;

  @Autowired
  private EntityManager entityManager;

  @Autowired
  private DailySummaryViewRepository dailyRepository;

  @Autowired
  private HourlyOccupancyViewRepository hourlyRepository;

  @Autowired
  private OperationalReportViewRepository operationalRepository;

  private UUID tenantA;
  private UUID tenantB;
  private UUID parkingA1;
  private UUID parkingA2;
  private UUID parkingB1;

  @BeforeEach
  void setUpFixtures() {
    tenantA = UUID.randomUUID();
    tenantB = UUID.randomUUID();
    parkingA1 = UUID.randomUUID();
    parkingA2 = UUID.randomUUID();
    parkingB1 = UUID.randomUUID();

    // 1. Insertar tenants y parkings en BD
    insertTenant(tenantA, "Tenant A");
    insertTenant(tenantB, "Tenant B");
    insertParkingLot(parkingA1, tenantA, "Sede Centro", "COP");
    insertParkingLot(parkingA2, tenantA, "Sede Norte", "COP");
    insertParkingLot(parkingB1, tenantB, "Sede Externa B", "USD");

    // 2. Insertar plazas (AVAILABLE, OCCUPIED, MAINTENANCE)
    UUID slot1 = insertSlot(parkingA1, tenantA, "C-01", "AVAILABLE", "CAR");
    UUID slot2 = insertSlot(parkingA1, tenantA, "C-02", "OCCUPIED", "CAR");
    UUID slot3 = insertSlot(parkingA1, tenantA, "M-01", "MAINTENANCE", "MOTORCYCLE"); // no debe contar en capacidad activa
    UUID slotB = insertSlot(parkingB1, tenantB, "B-01", "OCCUPIED", "CAR");

    // 3. Insertar tickets con fechas y duraciones controladas para hoy (2026-09-24)
    OffsetDateTime today8am = OffsetDateTime.of(2026, 9, 24, 8, 15, 0, 0, ZoneOffset.UTC);
    OffsetDateTime today9am = OffsetDateTime.of(2026, 9, 24, 9, 30, 0, 0, ZoneOffset.UTC); // 75 min
    OffsetDateTime today10am = OffsetDateTime.of(2026, 9, 24, 10, 0, 0, 0, ZoneOffset.UTC);
    OffsetDateTime today1130am = OffsetDateTime.of(2026, 9, 24, 11, 30, 0, 0, ZoneOffset.UTC); // 90 min

    UUID ticket1 = insertTicket(tenantA, parkingA1, slot2, "AAA-111", today8am, null, "OPEN", BigDecimal.ZERO);
    UUID ticket2 = insertTicket(tenantA, parkingA1, slot1, "BBB-222", today8am, today9am, "CLOSED", new BigDecimal("15000.00"));
    UUID ticket3 = insertTicket(tenantA, parkingA1, slot1, "CCC-333", today10am, today1130am, "CLOSED", new BigDecimal("20000.00"));
    UUID ticketB = insertTicket(tenantB, parkingB1, slotB, "ZZZ-999", today8am, null, "OPEN", BigDecimal.ZERO);

    // 4. Insertar pagos (PAID vs FAILED vs PENDING)
    insertPayment(tenantA, ticket2, new BigDecimal("15000.00"), "PAID");
    insertPayment(tenantA, ticket3, new BigDecimal("20000.00"), "FAILED"); // no debe computar en recaudación
    insertPayment(tenantB, ticketB, new BigDecimal("50.00"), "PAID"); // pertenece a tenant B

    entityManager.flush();
    entityManager.clear();
  }

  @Test
  @DisplayName("v_parking_daily_summary: debe calcular ingresos exactos (solo PAID), tickets y duración promedio")
  void shouldCalculateExactDailySummaryMetrics() {
    final LocalDate today = LocalDate.of(2026, 9, 24);
    final DailySummaryViewEntity summary = dailyRepository.findByParkingLotIdAndSummaryDate(parkingA1, today)
        .orElseThrow(() -> new AssertionError("Summary record must exist"));

    assertThat(summary.getTotalTickets()).isEqualTo(3);
    assertThat(summary.getCompletedTickets()).isEqualTo(2);
    assertThat(summary.getOngoingTickets()).isEqualTo(1);
    assertThat(summary.getUniqueVehicles()).isEqualTo(3);
    // Solo ticket2 tiene pago PAID (15000.00); ticket3 fue FAILED
    assertThat(summary.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("15000.00"));
    // Duraciones cerradas: 75 min y 90 min -> Promedio = 82.50 min
    assertThat(summary.getAvgDurationMinutes()).isEqualTo(82.50);
  }

  @Test
  @DisplayName("v_parking_occupancy_hourly: debe calcular entradas, salidas y tasa de ocupación por hora")
  void shouldCalculateHourlyOccupancyAccurately() {
    final List<HourlyOccupancyViewEntity> hourlyList = hourlyRepository.findByParkingLotId(parkingA1);
    assertThat(hourlyList).isNotEmpty();

    // En la franja de las 08:00 UTC hubo 2 entradas (ticket1 y ticket2)
    final HourlyOccupancyViewEntity bucket8am = hourlyList.stream()
        .filter(h -> h.getHourBucket().getHour() == 8)
        .findFirst()
        .orElseThrow();
    assertThat(bucket8am.getCheckins()).isEqualTo(2);
    assertThat(bucket8am.getTotalCapacity()).isEqualTo(2); // slot1 y slot2 activos; slot3 en mantenimiento
    assertThat(bucket8am.getEstimatedOccupancyRate()).isEqualTo(100.00); // 2 tickets / 2 plazas activas
  }

  @Test
  @DisplayName("Aislamiento multi-tenant: tenantA nunca debe recibir datos pertenecientes a tenantB")
  void shouldStrictlyIsolateTenantsInDailyAndHourlySummaries() {
    final List<DailySummaryViewEntity> summariesA = dailyRepository.findAllByTenantId(tenantA);
    assertThat(summariesA)
        .isNotEmpty()
        .allMatch(s -> s.getTenantId().equals(tenantA))
        .noneMatch(s -> s.getTenantId().equals(tenantB));

    final List<OperationalReportViewEntity> reportsA = operationalRepository.findAllByTenantId(tenantA);
    assertThat(reportsA)
        .isNotEmpty()
        .allMatch(r -> r.getTenantId().equals(tenantA))
        .noneMatch(r -> r.getLicensePlate().equals("ZZZ-999"));
  }

  @Test
  @DisplayName("Parqueadero vacío o sin tickets debe retornar vacío/cero sin NullPointerException")
  void shouldHandleEmptyParkingGracefullyWithoutNpe() {
    final UUID emptyParking = UUID.randomUUID();
    insertParkingLot(emptyParking, tenantA, "Sede Nueva Vacía", "COP");
    insertSlot(emptyParking, tenantA, "V-01", "AVAILABLE", "CAR");

    final Optional<DailySummaryViewEntity> summary = dailyRepository.findByParkingLotIdAndSummaryDate(emptyParking, LocalDate.of(2026, 9, 24));
    assertThat(summary).isEmpty();

    final List<HourlyOccupancyViewEntity> hourly = hourlyRepository.findByParkingLotId(emptyParking);
    assertThat(hourly).isEmpty();
  }

  private void insertTenant(UUID id, String name) {
    entityManager.createNativeQuery(
        "INSERT INTO nivo.tenants (id, company_name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)")
        .setParameter(1, id).setParameter(2, name).executeUpdate();
  }

  private void insertParkingLot(UUID id, UUID tenant, String name, String currency) {
    UUID ownerId = UUID.randomUUID();
    entityManager.createNativeQuery(
        "INSERT INTO nivo.users (id, full_name, email, password, role, tenant_id, created_at) VALUES (?, 'Owner', 'owner@test.com', 'pwd', 'OWNER', ?, CURRENT_TIMESTAMP)")
        .setParameter(1, ownerId).setParameter(2, tenant).executeUpdate();

    entityManager.createNativeQuery(
        "INSERT INTO nivo.parking_lots (id, tenant_id, owner_id, name, currency, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
        .setParameter(1, id).setParameter(2, tenant).setParameter(3, ownerId).setParameter(4, name).setParameter(5, currency).executeUpdate();
  }

  private UUID insertSlot(UUID parking, UUID tenant, String number, String status, String type) {
    UUID id = UUID.randomUUID();
    entityManager.createNativeQuery(
        "INSERT INTO nivo.slots (id, parking_lot_id, tenant_id, slot_number, status, type, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
        .setParameter(1, id).setParameter(2, parking).setParameter(3, tenant).setParameter(4, number).setParameter(5, status).setParameter(6, type).executeUpdate();
    return id;
  }

  private UUID insertTicket(UUID tenant, UUID parking, UUID slot, String plate, OffsetDateTime entry, OffsetDateTime exit, String status, BigDecimal charge) {
    UUID id = UUID.randomUUID();
    entityManager.createNativeQuery(
        "INSERT INTO nivo.parking_tickets (id, tenant_id, slot_id, license_plate, entry_time, exit_time, status, total_to_charge, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
        .setParameter(1, id).setParameter(2, tenant).setParameter(3, slot).setParameter(4, plate).setParameter(5, entry).setParameter(6, exit).setParameter(7, status).setParameter(8, charge).executeUpdate();
    return id;
  }

  private void insertPayment(UUID tenant, UUID ticketId, BigDecimal amount, String status) {
    UUID id = UUID.randomUUID();
    entityManager.createNativeQuery(
        "INSERT INTO nivo.payments (id, tenant_id, parking_ticket_id, amount, status, payment_method, created_at) VALUES (?, ?, ?, ?, ?, 'EFFECTIVE', CURRENT_TIMESTAMP)")
        .setParameter(1, id).setParameter(2, tenant).setParameter(3, ticketId).setParameter(4, amount).setParameter(5, status).executeUpdate();
  }
}
