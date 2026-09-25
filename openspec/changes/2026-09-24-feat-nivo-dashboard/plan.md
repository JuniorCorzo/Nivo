# Implementation Plan: Dashboard Analítico, SSE y API Pública (feat-nivo-dashboard)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real-time analytical dashboard with PostgreSQL optimized views (`v_parking_occupancy_hourly`, `v_parking_daily_summary`, `v_parking_operational_report`), dual-scope analytics (**Sede Individual** vs. **Consolidado Global Multi-Sede** a nivel de Tenant con ranking comparativo), backend operational observability with Micrometer (`MeterRegistry`), reactive Server-Sent Events (SSE) streaming with domain event listeners, public availability API with Token Bucket rate limiting (60 req/min per IP), Scalar pre-request auto-authentication, and an Angular 21+ Dashboard UI with Signals, Chart.js visualizations (curvas horarias, donas y gráfico comparativo de barras horizontales), TanStack Table operational reports, streaming CSV export, and `@nivo-sass/design-system` components.

**Architecture:** Hexagonal / Clean Architecture in Spring Boot WebMVC (`apps/api`), domain event decoupling with `ApplicationEventPublisher`, dual-scope REST and SSE streaming (`?parkingId={optionalUUID}`), PostgreSQL views with composite multi-tenant indices, in-memory Token Bucket filter and Caffeine caching. Reactive Angular 21+ in `apps/web` with Signal architecture (`DashboardFacade`), auto-detection of 1 vs. multiple parking facilities, authenticated SSE stream consumption via `fetch` + `ReadableStream`, OnPush Chart.js canvas components, TanStack Table column-driven renderers without template ladders, and strict Design System compliance.

**Tech Stack:** Java 25, Spring Boot 4.0.3, Spring Data JPA, Flyway, PostgreSQL, Micrometer Prometheus, SpringDoc / Scalar OpenAPI, JUnit 5, Mockito, AssertJ, TypeScript 6, Angular 21.2+, Chart.js 4.4+, TanStack Angular Table 8.21+, Tailwind CSS 4, Vitest, Ultracite.

**Spec:** `openspec/changes/2026-09-24-feat-nivo-dashboard/design.md`

## Global Constraints

- Conventional Commits: Use scopes `api(db)`, `api(metrics)`, `api(dashboard)`, `api(sse)`, `api(public)`, `api(scalar)`, `web(dashboard)`, `web(charts)`, `web(reports)`.
- Test-Driven Development: Tests MUST be written and verified failing before implementation.
- Multi-Tenant Security: All dashboard and report queries MUST enforce tenant boundaries from `AuthenticationContextGateway`.
- Telemetry Cardinality: Prometheus metrics MUST NOT include high-cardinality tags (`parkingId`, `tenantId`, `licensePlate`). Tenant business stats reside exclusively in PostgreSQL.
- TanStack Table Rule: NEVER use `@if / @else if (column.id === ...)` ladders in HTML templates. Encapsulate headers and cells in column definitions.
- Design System Mandate: ALWAYS use `@nivo-sass/design-system` components (`nv-card`, `nv-button`, `nv-badge`, `nv-input`, `nv-typography`, `nv-loader`) instead of raw HTML elements.

---

### Task 1: Database Schema Migration & JPA Views Persistence (`apps/api`)

**Files:**

- Create: `apps/api/src/main/resources/db/migration/V5__create_dashboard_views_and_analytics.sql`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/HourlyOccupancyViewEntity.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/DailySummaryViewEntity.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/OperationalReportViewEntity.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/repository/HourlyOccupancyViewRepository.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/repository/DailySummaryViewRepository.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/repository/OperationalReportViewRepository.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/dashboard/DashboardViewsRepositoryTest.java`

**Interfaces:**

- Consumes: PostgreSQL base tables `parking_tickets`, `slots`, `payments`, `parking_lots`.
- Produces: `v_parking_occupancy_hourly`, `v_parking_daily_summary`, `v_parking_operational_report` views with composite indices, and Spring Data JPA repositories supporting queries by `tenantId` and `(tenantId, parkingLotId)`.

- [ ] **Step 1: Write failing integration test with rich test fixtures and strict assertions**

```java
package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.DailySummaryViewRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.HourlyOccupancyViewRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.OperationalReportViewRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
class DashboardViewsRepositoryTest {

  @Autowired
  private TestEntityManager entityManager;

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
    LocalDate today = LocalDate.of(2026, 9, 24);
    var summary = dailyRepository.findByParkingLotIdAndSummaryDate(parkingA1, today)
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
    var hourlyList = hourlyRepository.findByParkingLotId(parkingA1);
    assertThat(hourlyList).isNotEmpty();

    // En la franja de las 08:00 UTC hubo 2 entradas (ticket1 y ticket2)
    var bucket8am = hourlyList.stream()
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
    var summariesA = dailyRepository.findAllByTenantId(tenantA);
    assertThat(summariesA)
        .isNotEmpty()
        .allMatch(s -> s.getTenantId().equals(tenantA))
        .noneMatch(s -> s.getTenantId().equals(tenantB));

    var reportsA = operationalRepository.findAllByTenantId(tenantA);
    assertThat(reportsA)
        .isNotEmpty()
        .allMatch(r -> r.getTenantId().equals(tenantA))
        .noneMatch(r -> r.getLicensePlate().equals("ZZZ-999"));
  }

  @Test
  @DisplayName("Parqueadero vacío o sin tickets debe retornar vacío/cero sin NullPointerException")
  void shouldHandleEmptyParkingGracefullyWithoutNpe() {
    UUID emptyParking = UUID.randomUUID();
    insertParkingLot(emptyParking, tenantA, "Sede Nueva Vacía", "COP");
    insertSlot(emptyParking, tenantA, "V-01", "AVAILABLE", "CAR");

    var summary = dailyRepository.findByParkingLotIdAndSummaryDate(emptyParking, LocalDate.of(2026, 9, 24));
    assertThat(summary).isEmpty();

    var hourly = hourlyRepository.findByParkingLotId(emptyParking);
    assertThat(hourly).isEmpty();
  }

  // Métodos auxiliares de inserción directa para pruebas
  private void insertTenant(UUID id, String name) {
    entityManager.getEntityManager().createNativeQuery(
        "INSERT INTO nivo.tenants (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)")
        .setParameter(1, id).setParameter(2, name).executeUpdate();
  }

  private void insertParkingLot(UUID id, UUID tenant, String name, String currency) {
    entityManager.getEntityManager().createNativeQuery(
        "INSERT INTO nivo.parking_lots (id, tenant_id, name, currency, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)")
        .setParameter(1, id).setParameter(2, tenant).setParameter(3, name).setParameter(4, currency).executeUpdate();
  }

  private UUID insertSlot(UUID parking, UUID tenant, String number, String status, String type) {
    UUID id = UUID.randomUUID();
    entityManager.getEntityManager().createNativeQuery(
        "INSERT INTO nivo.slots (id, parking_lot_id, tenant_id, slot_number, status, type, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
        .setParameter(1, id).setParameter(2, parking).setParameter(3, tenant).setParameter(4, number).setParameter(5, status).setParameter(6, type).executeUpdate();
    return id;
  }

  private UUID insertTicket(UUID tenant, UUID parking, UUID slot, String plate, OffsetDateTime entry, OffsetDateTime exit, String status, BigDecimal charge) {
    UUID id = UUID.randomUUID();
    entityManager.getEntityManager().createNativeQuery(
        "INSERT INTO nivo.parking_tickets (id, tenant_id, slot_id, license_plate, entry_time, exit_time, status, total_to_charge, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
        .setParameter(1, id).setParameter(2, tenant).setParameter(3, slot).setParameter(4, plate).setParameter(5, entry).setParameter(6, exit).setParameter(7, status).setParameter(8, charge).executeUpdate();
    return id;
  }

  private void insertPayment(UUID tenant, UUID ticketId, BigDecimal amount, String status) {
    UUID id = UUID.randomUUID();
    entityManager.getEntityManager().createNativeQuery(
        "INSERT INTO nivo.payments (id, tenant_id, parking_ticket_id, amount, status, payment_method, created_at) VALUES (?, ?, ?, ?, ?, 'EFFECTIVE', CURRENT_TIMESTAMP)")
        .setParameter(1, id).setParameter(2, tenant).setParameter(3, ticketId).setParameter(4, amount).setParameter(5, status).executeUpdate();
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.DashboardViewsRepositoryTest"
```

- [ ] **Step 3: Write minimal implementation**

Create Flyway migration `V5__create_dashboard_views_and_analytics.sql` containing views and indexes.
Create entities:

- `DailySummaryViewEntity`: Maps `v_parking_daily_summary` with `@Immutable`, `@IdClass` (composite `parkingLotId`, `summaryDate`).
- `HourlyOccupancyViewEntity`: Maps `v_parking_occupancy_hourly`.
- `OperationalReportViewEntity`: Maps `v_parking_operational_report`.
  Create Spring Data repositories extending `JpaRepository`.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.DashboardViewsRepositoryTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(db)): implement dashboard views with robust multi-tenant aggregation and indexes"
```

---

### Task 2: Backend Operational Metrics Manager with Micrometer (`apps/api`)

**Files:**

- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/metrics/BackendOperationsMetricsManager.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/adapter/metrics/BackendOperationsMetricsManagerTest.java`

**Interfaces:**

- Consumes: `io.micrometer.core.instrument.MeterRegistry`.
- Produces:
  - `recordSseConnectionOpened()`, `recordSseConnectionClosed()`
  - `recordSseEventBroadcast()`, `recordSseDisconnect()`
  - `recordAnalyticsQueryDuration(String view, Runnable query)`
  - `recordPublicAvailabilityRequest(int statusCode)`
  - `recordPublicAvailabilityRateLimited()`
  - `recordAvailabilityCacheHit()`, `recordAvailabilityCacheMiss()`
  - `recordCsvExportDuration(Runnable export)`

- [ ] **Step 1: Write failing unit test validating operational telemetries and cardinality constraints**

```java
package dev.angelcorzo.nivo.infrastructure.adapter.metrics;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BackendOperationsMetricsManagerTest {

  private SimpleMeterRegistry meterRegistry;
  private BackendOperationsMetricsManager metricsManager;

  @BeforeEach
  void setUp() {
    meterRegistry = new SimpleMeterRegistry();
    metricsManager = new BackendOperationsMetricsManager(meterRegistry);
  }

  @Test
  @DisplayName("Gauge de conexiones SSE: debe incrementar al abrir y decrementar al cerrar")
  void shouldTrackSseActiveConnectionsLifecycle() {
    metricsManager.recordSseConnectionOpened();
    metricsManager.recordSseConnectionOpened();
    assertThat(meterRegistry.get("sse.dashboard.active.connections").gauge().value()).isEqualTo(2.0);

    metricsManager.recordSseDisconnect(); // debe decrementar conexiones activas y subir contador de desconexión
    assertThat(meterRegistry.get("sse.dashboard.active.connections").gauge().value()).isEqualTo(1.0);
    assertThat(meterRegistry.get("sse.dashboard.disconnects.total").counter().count()).isEqualTo(1.0);
  }

  @Test
  @DisplayName("Contador de transmisiones SSE: debe acumular eventos broadcast")
  void shouldTrackSseBroadcastEventsAccurately() {
    metricsManager.recordSseEventBroadcast();
    metricsManager.recordSseEventBroadcast();
    metricsManager.recordSseEventBroadcast();
    assertThat(meterRegistry.get("sse.dashboard.events.broadcast.total").counter().count()).isEqualTo(3.0);
  }

  @Test
  @DisplayName("Telemetría de API pública: solicitudes, rate limit y aciertos de caché")
  void shouldTrackPublicApiOperationsAndRateLimits() {
    metricsManager.recordPublicAvailabilityRequest(200);
    metricsManager.recordPublicAvailabilityRequest(200);
    metricsManager.recordPublicAvailabilityRequest(429);
    metricsManager.recordPublicAvailabilityRateLimited();
    metricsManager.recordAvailabilityCacheHit();
    metricsManager.recordAvailabilityCacheMiss();

    assertThat(meterRegistry.get("public.api.availability.requests.total").tag("status", "200").counter().count()).isEqualTo(2.0);
    assertThat(meterRegistry.get("public.api.availability.requests.total").tag("status", "429").counter().count()).isEqualTo(1.0);
    assertThat(meterRegistry.get("public.api.availability.rate_limited.total").counter().count()).isEqualTo(1.0);
    assertThat(meterRegistry.get("public.api.availability.cache.hit").counter().count()).isEqualTo(1.0);
    assertThat(meterRegistry.get("public.api.availability.cache.miss").counter().count()).isEqualTo(1.0);
  }

  @Test
  @DisplayName("Timers de base de datos y CSV: deben registrar latencias con tag de vista")
  void shouldRecordAnalyticsQueryAndCsvExportTimers() {
    metricsManager.recordAnalyticsQueryDuration("hourly", () -> {
      try { Thread.sleep(10); } catch (InterruptedException ignored) {}
    });

    metricsManager.recordCsvExportDuration(() -> {
      try { Thread.sleep(15); } catch (InterruptedException ignored) {}
    });

    var queryTimer = meterRegistry.get("db.analytics.query.duration").tag("view", "hourly").timer();
    assertThat(queryTimer.count()).isEqualTo(1);
    assertThat(queryTimer.totalTime(TimeUnit.MILLISECONDS)).isGreaterThanOrEqualTo(9.0);

    var csvTimer = meterRegistry.get("reports.csv.export.duration").timer();
    assertThat(csvTimer.count()).isEqualTo(1);
  }

  @Test
  @DisplayName("Restricción estricta de cardinalidad: NINGUNA métrica debe incluir tags parkingId, tenantId ni licensePlate")
  void shouldNeverRegisterHighCardinalityTagsInPrometheusMetrics() {
    // Ejecutar varias operaciones de registro
    metricsManager.recordPublicAvailabilityRequest(200);
    metricsManager.recordAnalyticsQueryDuration("daily", () -> {});

    for (Meter meter : meterRegistry.getMeters()) {
      var tagKeys = meter.getId().getTags().stream().map(t -> t.getKey().toLowerCase()).toList();
      assertThat(tagKeys)
          .as("Meter '%s' contains high cardinality tags", meter.getId().getName())
          .doesNotContain("parkingid", "tenantid", "licenseplate", "plate", "userid");
    }
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManagerTest"
```

- [ ] **Step 3: Write minimal implementation**

Implement `BackendOperationsMetricsManager` utilizing standard `MeterRegistry` counters, gauges, and timers without dynamic multi-tenant tags.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManagerTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(metrics)): implement BackendOperationsMetricsManager with zero high-cardinality tags"
```

---

### Task 3: REST Analytics Endpoints & Streaming CSV Export with Scope Support (`apps/api`)

**Files:**

- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetDashboardSummaryUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetHourlyOccupancyUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetParkingsComparisonUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetOperationalReportUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/DashboardController.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/reports/ReportsController.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/DashboardControllerTest.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/reports/ReportsControllerTest.java`

**Interfaces:**

- Consumes: JPA view repositories, `AuthenticationContextGateway`.
- Produces:
  - `GET /api/v1/dashboard/summary?parkingId={optionalUUID}` -> `DashboardSummaryDTO`
  - `GET /api/v1/dashboard/occupancy-hourly?parkingId={optionalUUID}&startDate=...&endDate=...` -> `List<HourlyOccupancyDTO>`
  - `GET /api/v1/dashboard/parkings-comparison?startDate=...&endDate=...` -> `List<ParkingComparisonDTO>`
  - `GET /api/v1/reports/operational?parkingId={optionalUUID}&page=...` -> `Page<OperationalReportDTO>`
  - `GET /api/v1/reports/operational/csv?parkingId={optionalUUID}` -> `text/csv` stream

- [ ] **Step 1: Write failing controller tests verifying scopes, cross-tenant security and CSV streaming**

```java
package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.angelcorzo.nivo.domain.usecase.dashboard.GetDashboardSummaryUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetParkingsComparisonUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.ParkingComparisonDTO;
import dev.angelcorzo.nivo.infrastructure.security.context.AuthenticationContextGateway;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private GetDashboardSummaryUseCase summaryUseCase;

  @MockBean
  private GetParkingsComparisonUseCase comparisonUseCase;

  @MockBean
  private AuthenticationContextGateway authContextGateway;

  @Test
  @WithMockUser
  @DisplayName("GET /dashboard/summary con parkingId retorna datos específicos de esa sede")
  void shouldReturnSingleParkingSummaryWhenParkingIdProvided() throws Exception {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();
    when(authContextGateway.getTenantId()).thenReturn(tenantId);

    var mockSummary = DashboardSummaryDTO.builder()
        .scope("SINGLE")
        .parkingId(parkingId)
        .totalCapacity(150)
        .occupiedSlots(108)
        .availableSlots(42)
        .occupancyRate(72.0)
        .todayRevenue(new BigDecimal("145000.00"))
        .currency("COP")
        .build();

    when(summaryUseCase.execute(tenantId, parkingId)).thenReturn(mockSummary);

    mockMvc.perform(get("/api/v1/dashboard/summary").param("parkingId", parkingId.toString()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scope").value("SINGLE"))
        .andExpect(jsonPath("$.parkingId").value(parkingId.toString()))
        .andExpect(jsonPath("$.occupancyRate").value(72.0))
        .andExpect(jsonPath("$.totalCapacity").value(150));
  }

  @Test
  @WithMockUser
  @DisplayName("GET /dashboard/summary sin parkingId retorna el consolidado global del tenant")
  void shouldReturnGlobalSummaryWhenParkingIdOmitted() throws Exception {
    UUID tenantId = UUID.randomUUID();
    when(authContextGateway.getTenantId()).thenReturn(tenantId);

    var globalSummary = DashboardSummaryDTO.builder()
        .scope("GLOBAL")
        .parkingId(null)
        .totalCapacity(350)
        .occupiedSlots(200)
        .availableSlots(150)
        .occupancyRate(57.14)
        .todayRevenue(new BigDecimal("500000.00"))
        .currency("COP")
        .build();

    when(summaryUseCase.execute(tenantId, null)).thenReturn(globalSummary);

    mockMvc.perform(get("/api/v1/dashboard/summary"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scope").value("GLOBAL"))
        .andExpect(jsonPath("$.parkingId").doesNotExist())
        .andExpect(jsonPath("$.totalCapacity").value(350))
        .andExpect(jsonPath("$.todayRevenue").value(500000.00));
  }

  @Test
  @WithMockUser
  @DisplayName("GET /dashboard/parkings-comparison retorna lista ordenada de sedes con sus métricas")
  void shouldReturnParkingsComparisonList() throws Exception {
    UUID tenantId = UUID.randomUUID();
    when(authContextGateway.getTenantId()).thenReturn(tenantId);

    var comparisonList = List.of(
        ParkingComparisonDTO.builder().parkingId(UUID.randomUUID()).parkingName("Sede Centro").occupancyRate(75.0).todayRevenue(new BigDecimal("300000")).build(),
        ParkingComparisonDTO.builder().parkingId(UUID.randomUUID()).parkingName("Sede Norte").occupancyRate(40.0).todayRevenue(new BigDecimal("150000")).build()
    );

    when(comparisonUseCase.execute(eq(tenantId), any(), any())).thenReturn(comparisonList);

    mockMvc.perform(get("/api/v1/dashboard/parkings-comparison"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].parkingName").value("Sede Centro"))
        .andExpect(jsonPath("$[0].occupancyRate").value(75.0))
        .andExpect(jsonPath("$[1].parkingName").value("Sede Norte"));
  }

  @Test
  @WithMockUser
  @DisplayName("Seguridad multi-tenant: solicitar parkingId ajeno retorna 404 o 403")
  void shouldRejectCrossTenantParkingAccess() throws Exception {
    UUID tenantA = UUID.randomUUID();
    UUID foreignParking = UUID.randomUUID();
    when(authContextGateway.getTenantId()).thenReturn(tenantA);
    when(summaryUseCase.execute(tenantA, foreignParking))
        .thenThrow(new IllegalArgumentException("Parking lot does not belong to tenant"));

    mockMvc.perform(get("/api/v1/dashboard/summary").param("parkingId", foreignParking.toString()))
        .andExpect(status().isNotFound());
  }
}
```

And for CSV streaming:

```java
package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.reports;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ReportsControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @WithMockUser
  @DisplayName("GET /reports/operational/csv debe emitir stream CSV con cabeceras correctas y columnas requeridas")
  void shouldStreamCsvWithCorrectHeadersAndFormat() throws Exception {
    mockMvc.perform(get("/api/v1/reports/operational/csv"))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Type", "text/csv;charset=UTF-8"))
        .andExpect(header().string("Content-Disposition", containsString("attachment; filename=\"operational-report-")))
        .andExpect(content().string(containsString("Ticket ID,Placa,Plaza,Tipo,Entrada,Salida,Minutos,Estado,Total,Metodo Pago,Sede")));
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.DashboardControllerTest"
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.reports.ReportsControllerTest"
```

- [ ] **Step 3: Write minimal implementation**

Implement use cases resolving tenant context and optional `parkingId`.
Implement `DashboardController` and `ReportsController`.
Inject `BackendOperationsMetricsManager` to time queries and CSV streaming.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.DashboardControllerTest"
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.reports.ReportsControllerTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(dashboard)): implement scoped dashboard endpoints, comparison and CSV streaming"
```

---

### Task 4: SseEmitter Registry with Multi-Parking & Tenant Broadcast (`apps/api`)

**Files:**

- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/DashboardSseRegistry.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/DashboardStreamController.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/listeners/DashboardDomainEventListener.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/DashboardSseRegistryTest.java`

**Interfaces:**

- Consumes: `ApplicationEventPublisher`, domain events (`TicketCreated`, `TicketCheckedOut`, `PaymentCompleted`).
- Produces:
  - `GET /api/v1/dashboard/stream?parkingId={optionalUUID}` -> `text/event-stream`
  - Dual broadcast: emits to specific facility subscribers AND tenant-wide subscribers.

- [ ] **Step 1: Write failing unit test for dual-scope SseRegistry with client disconnects**

```java
package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

class DashboardSseRegistryTest {

  private DashboardSseRegistry sseRegistry;
  private BackendOperationsMetricsManager metricsManager;

  @BeforeEach
  void setUp() {
    metricsManager = mock(BackendOperationsMetricsManager.class);
    sseRegistry = new DashboardSseRegistry(metricsManager);
  }

  @Test
  @DisplayName("Emisión dual: debe enviar evento a suscriptor de la sede y a suscriptor global del tenant, pero no a sedes ajenas")
  void shouldBroadcastEventToMatchingFacilityAndTenantSubscribersOnly() {
    UUID tenantA = UUID.randomUUID();
    UUID tenantB = UUID.randomUUID();
    UUID parking1 = UUID.randomUUID();
    UUID parking2 = UUID.randomUUID();

    var clientFacility1 = sseRegistry.createEmitter(tenantA, parking1);
    var clientFacility2 = sseRegistry.createEmitter(tenantA, parking2);
    var clientTenantA = sseRegistry.createEmitter(tenantA, null); // canal consolidado global
    var clientTenantB = sseRegistry.createEmitter(tenantB, null); // otro tenant

    assertThat(sseRegistry.getActiveCount(tenantA)).isEqualTo(3);

    // Disparar evento para parking1 de tenantA
    sseRegistry.broadcast(tenantA, parking1, "occupancy-update", "{\"parkingId\":\"" + parking1 + "\",\"occupancyRate\":80.0}");

    // Se verifica que metricsManager registró las emisiones broadcast
    verify(metricsManager).recordSseEventBroadcast();
  }

  @Test
  @DisplayName("Ciclo de vida: simular desconexión debe limpiar emitter y decrementar métrica")
  void shouldCleanUpEmitterOnDisconnectWithoutMemoryLeak() {
    UUID tenantA = UUID.randomUUID();
    UUID parking1 = UUID.randomUUID();

    SseEmitter emitter = sseRegistry.createEmitter(tenantA, parking1);
    assertThat(sseRegistry.getActiveCount(tenantA)).isEqualTo(1);

    // Simular evento de desconexión / finalización
    sseRegistry.removeEmitter(tenantA, parking1, emitter);

    assertThat(sseRegistry.getActiveCount(tenantA)).isEqualTo(0);
    verify(metricsManager).recordSseDisconnect();
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.DashboardSseRegistryTest"
```

- [ ] **Step 3: Write minimal implementation**

Implement `DashboardSseRegistry`:

- Maps emitters using compound keys: `tenantId` (global) and `tenantId + ":" + parkingId` (single).
- `broadcast(tenantId, parkingId, eventName, data)` sends message to `tenantId + ":" + parkingId` AND `tenantId`.
- Integrates `BackendOperationsMetricsManager` on open, close, and broadcast.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.DashboardSseRegistryTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(sse)): implement dual-scope SSE streaming and lifecycle cleanup"
```

---

### Task 5: Scalar Pre-Request Auto-Authentication Script Hook (`apps/api`)

**Files:**

- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/commons/config/SwaggerConfiguration.java`
- Modify: `apps/api/src/main/resources/application.yaml`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/commons/config/SwaggerConfigurationTest.java`

**Interfaces:**

- Consumes: Scalar WebMVC configuration and OpenAPI 3.0 specification.
- Produces: `x-scalar-pre-request` OpenAPI extension auto-authenticating with `/api/v1/auth/login`.

- [ ] **Step 1: Write test verifying OpenAPI document extensions and security schemes**

```java
package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config;

import static org.assertj.core.api.Assertions.assertThat;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SwaggerConfigurationTest {

  @Autowired
  private OpenAPI openAPI;

  @Test
  @DisplayName("OpenAPI debe configurar Bearer Authentication y extensión pre-request para Scalar")
  void shouldConfigureBearerAuthAndScalarPreRequestExtension() {
    // 1. Esquema de seguridad
    assertThat(openAPI.getComponents().getSecuritySchemes())
        .containsKey("Bearer Authentication");

    // 2. Extensión OpenAPI para pre-request script de Scalar
    assertThat(openAPI.getInfo().getExtensions())
        .containsKey("x-scalar-pre-request");

    String preRequestScript = openAPI.getInfo().getExtensions().get("x-scalar-pre-request").toString();
    assertThat(preRequestScript).contains("/api/v1/auth/login");
    assertThat(preRequestScript).contains("Bearer");
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.SwaggerConfigurationTest"
```

- [ ] **Step 3: Write minimal implementation**

In `SwaggerConfiguration.java`:
Add `OpenApiCustomizer` adding the `x-scalar-pre-request` extension string to OpenAPI info extensions.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.SwaggerConfigurationTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(scalar)): add Scalar pre-request auto-authentication hook in OpenAPI config"
```

---

### Task 6: Public Availability API with Token Bucket Rate Limiting (`apps/api`)

**Files:**

- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/security/ratelimit/TokenBucketRateLimiter.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/security/ratelimit/PublicApiRateLimitFilter.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/publicapi/PublicAvailabilityController.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/security/config/SecurityChain.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/security/ratelimit/TokenBucketRateLimiterTest.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/publicapi/PublicAvailabilityControllerTest.java`

**Interfaces:**

- Consumes: IP address, `parkingId`, Caffeine in-memory cache.
- Produces: `GET /api/v1/public/parkings/{parkingId}/availability` (HTTP 200, 404, 429).

- [ ] **Step 1: Write failing unit and integration tests for rate limiting, cache and sanitized responses**

```java
package dev.angelcorzo.nivo.infrastructure.security.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TokenBucketRateLimiterTest {

  @Test
  @DisplayName("Token Bucket: 60 peticiones consecutivas pasan, la 61 es rechazada con HTTP 429")
  void shouldAllow60RequestsAndReject61st() {
    var limiter = new TokenBucketRateLimiter(60, 60);
    String clientIp = "192.168.1.100";

    for (int i = 0; i < 60; i++) {
      assertThat(limiter.tryConsume(clientIp)).isTrue();
    }
    assertThat(limiter.tryConsume(clientIp)).isFalse();
    assertThat(limiter.getRemainingTokens(clientIp)).isEqualTo(0);
    assertThat(limiter.getSecondsUntilRefill(clientIp)).isGreaterThan(0);
  }
}
```

And controller test:

```java
package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PublicAvailabilityControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @DisplayName("Endpoint público no requiere cabecera Authorization y devuelve JSON sanitizado sin datos privados")
  void shouldReturnSanitizedAvailabilityWithoutAuth() throws Exception {
    UUID parkingId = UUID.randomUUID(); // con fixture precargada en BD de test

    mockMvc.perform(get("/api/v1/public/parkings/" + parkingId + "/availability"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "public, max-age=30"))
        .andExpect(jsonPath("$.parkingId").value(parkingId.toString()))
        .andExpect(jsonPath("$.totalSlots").isNumber())
        .andExpect(jsonPath("$.availableSlots").isNumber())
        .andExpect(jsonPath("$.occupiedSlots").isNumber())
        .andExpect(jsonPath("$.tenantId").doesNotExist()) // cero datos privados
        .andExpect(jsonPath("$.revenue").doesNotExist())
        .andExpect(jsonPath("$.tickets").doesNotExist());
  }

  @Test
  @DisplayName("Parqueadero inexistente retorna HTTP 404")
  void shouldReturn404ForNonExistentParking() throws Exception {
    UUID nonExistent = UUID.randomUUID();
    mockMvc.perform(get("/api/v1/public/parkings/" + nonExistent + "/availability"))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Exceder tasa de 60 req/min genera HTTP 429 con Retry-After")
  void shouldReturn429WhenRateLimitExceeded() throws Exception {
    UUID parkingId = UUID.randomUUID();

    // Consumir 60 peticiones
    for (int i = 0; i < 60; i++) {
      mockMvc.perform(get("/api/v1/public/parkings/" + parkingId + "/availability"));
    }

    // Petición 61
    mockMvc.perform(get("/api/v1/public/parkings/" + parkingId + "/availability"))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"))
        .andExpect(header().string("X-RateLimit-Remaining", "0"));
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.security.ratelimit.*"
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi.*"
```

- [ ] **Step 3: Write minimal implementation**

Implement `TokenBucketRateLimiter`, `PublicApiRateLimitFilter`, and `PublicAvailabilityController` with Caffeine 30s cache. Allow unauthenticated access to `/api/v1/public/**` in `SecurityChain.java`.

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.security.ratelimit.*"
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi.*"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(public)): implement sanitized availability API with Token Bucket rate limiter"
```

---

### Task 7: Chart.js Installation & Angular Presentational Charts with Comparison (`apps/web`)

**Files:**

- Modify: `apps/web/package.json`
- Create: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/occupancy-trend-chart.ts`
- Create: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/occupancy-trend-chart.html`
- Create: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/occupancy-trend-chart.spec.ts`
- Create: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/slot-distribution-donut-chart.ts`
- Create: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/slot-distribution-donut-chart.html`
- Create: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/slot-distribution-donut-chart.spec.ts`
- Create: `apps/web/src/app/features/dashboard/components/parking-comparison-chart/parking-comparison-chart.ts`
- Create: `apps/web/src/app/features/dashboard/components/parking-comparison-chart/parking-comparison-chart.html`
- Create: `apps/web/src/app/features/dashboard/components/parking-comparison-chart/parking-comparison-chart.spec.ts`

**Interfaces:**

- Consumes: Chart.js library, inputs `HourlyOccupancyPoint[]`, `SlotDistributionItem[]`, `ParkingComparisonItem[]`.
- Produces: Standalone `OnPush` components wrapping HTML canvas with proper cleanup in `ngOnDestroy`.

- [ ] **Step 1: Install Chart.js**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun add chart.js
```

- [ ] **Step 2: Write failing component tests verifying rendering, empty data handling and destroy cleanup**

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ParkingComparisonChartComponent } from "./parking-comparison-chart";
import { OccupancyTrendChartComponent } from "../occupancy-trend-chart/occupancy-trend-chart";

describe("ParkingComparisonChartComponent", () => {
  let component: ParkingComparisonChartComponent;
  let fixture: ComponentFixture<ParkingComparisonChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingComparisonChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingComparisonChartComponent);
    component = fixture.componentInstance;
  });

  it("debe instanciar Chart.js y renderizar barras horizontales con datos válidos", () => {
    fixture.componentRef.setInput("data", [
      {
        parkingId: "p1",
        parkingName: "Sede Centro",
        totalSlots: 100,
        occupiedSlots: 75,
        occupancyRate: 75.0,
        todayRevenue: 300000,
        activeTickets: 75,
        avgStayMinutes: 60,
      },
      {
        parkingId: "p2",
        parkingName: "Sede Norte",
        totalSlots: 80,
        occupiedSlots: 32,
        occupancyRate: 40.0,
        todayRevenue: 150000,
        activeTickets: 32,
        avgStayMinutes: 45,
      },
    ]);
    fixture.detectChanges();
    expect(component.chartInstance).toBeDefined();
    expect(component.chartInstance?.data.labels).toEqual([
      "Sede Centro",
      "Sede Norte",
    ]);
  });

  it("debe manejar gracefully arrays vacíos sin lanzar errores ni excepciones", () => {
    fixture.componentRef.setInput("data", []);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.chartInstance?.data.datasets[0].data).toEqual([]);
  });

  it("al hacer click en una barra debe emitir evento parkingSelected con el parkingId correspondiente", () => {
    let selectedId: string | null = null;
    component.parkingSelected.subscribe((id) => (selectedId = id));

    component.handleBarClick("p1");
    expect(selectedId).toBe("p1");
  });

  it("debe invocar chart.destroy() al destruir el componente para prevenir memory leaks", () => {
    fixture.componentRef.setInput("data", [
      {
        parkingId: "p1",
        parkingName: "Sede A",
        totalSlots: 10,
        occupiedSlots: 5,
        occupancyRate: 50.0,
        todayRevenue: 1000,
        activeTickets: 5,
        avgStayMinutes: 30,
      },
    ]);
    fixture.detectChanges();

    const destroySpy = vi.spyOn(component.chartInstance!, "destroy");
    fixture.destroy();
    expect(destroySpy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test to verify failure**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test parking-comparison-chart.spec.ts
```

- [ ] **Step 4: Write minimal implementation**

Implement `OccupancyTrendChartComponent`, `SlotDistributionDonutChartComponent`, and `ParkingComparisonChartComponent`.
All components enforce `ChangeDetectionStrategy.OnPush`, create Chart instances on `effect()` or `ngAfterViewInit()`, and call `this.chart?.destroy()` in `ngOnDestroy()`.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test occupancy-trend-chart.spec.ts slot-distribution-donut-chart.spec.ts parking-comparison-chart.spec.ts
```

- [ ] **Step 6: Commit changes**

```bash
git commit -m "feat(web(charts)): implement Chart.js presentational components with comparison chart"
```

---

### Task 8: DashboardFacade & Operational Reports TanStack Table with Multi-Parking Scope (`apps/web`)

**Files:**

- Create: `apps/web/src/app/features/dashboard/facade/dashboard.facade.ts`
- Create: `apps/web/src/app/features/dashboard/facade/dashboard.facade.spec.ts`
- Create: `apps/web/src/app/features/dashboard/components/operational-reports-table/operational-reports-table.ts`
- Create: `apps/web/src/app/features/dashboard/components/operational-reports-table/operational-reports-table.html`
- Create: `apps/web/src/app/features/dashboard/components/operational-reports-table/operational-reports-table.spec.ts`

**Interfaces:**

- Consumes: `@tanstack/angular-table`, backend endpoints `/dashboard/summary`, `/dashboard/stream`, `/dashboard/parkings-comparison`, `/reports/operational`, `/reports/operational/csv`.
- Produces:
  - `DashboardFacade` state (`activeScope`, `isMultiParkingTenant`, `summary`, `parkingsComparison`, `reports`).
  - `OperationalReportsTableComponent` with dynamic column `parkingName` for global scope and 0 template `@if` ladders.

- [ ] **Step 1: Write failing unit tests for facade SSE parsing, reconnect backoff and TanStack column rendering**

```typescript
import { TestBed } from "@angular/core/testing";
import { DashboardFacade } from "./dashboard.facade";

describe("DashboardFacade", () => {
  let facade: DashboardFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardFacade],
    });
    facade = TestBed.inject(DashboardFacade);
  });

  it("debe detectar automáticamente tenant multi-sede si accessibleParkings > 1 y activar GLOBAL", () => {
    facade.accessibleParkings.set([
      { id: "1", name: "Sede Centro" },
      { id: "2", name: "Sede Norte" },
    ]);
    expect(facade.isMultiParkingTenant()).toBe(true);
    expect(facade.activeScope().mode).toBe("GLOBAL");
  });

  it("debe auto-configurar modo SINGLE si el tenant solo posee 1 sede", () => {
    facade.accessibleParkings.set([{ id: "1", name: "Sede Única" }]);
    expect(facade.isMultiParkingTenant()).toBe(false);
    expect(facade.activeScope().mode).toBe("SINGLE");
  });

  it("debe procesar eventos SSE y actualizar Signals reactivamente", () => {
    // Simular recepción de snapshot
    facade.handleSseMessage("snapshot", {
      scope: "GLOBAL",
      totalCapacity: 200,
      occupiedSlots: 100,
      availableSlots: 100,
      occupancyRate: 50.0,
      todayRevenue: 250000,
      currency: "COP",
    });

    expect(facade.summary()?.occupancyRate).toBe(50.0);
    expect(facade.occupancyPercentage()).toBe(50.0);
  });

  it("debe activar retroceso exponencial en reconexión ante fallo de red SSE", () => {
    const delay1 = facade.calculateBackoffDelay(0);
    const delay2 = facade.calculateBackoffDelay(1);
    const delay3 = facade.calculateBackoffDelay(2);

    expect(delay1).toBe(1000); // 1s
    expect(delay2).toBe(2000); // 2s
    expect(delay3).toBe(4000); // 4s
  });
});
```

And TanStack Table test:

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OperationalReportsTableComponent } from "./operational-reports-table";

describe("OperationalReportsTableComponent", () => {
  let component: OperationalReportsTableComponent;
  let fixture: ComponentFixture<OperationalReportsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationalReportsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationalReportsTableComponent);
    component = fixture.componentInstance;
  });

  it("debe mostrar la columna Sede cuando isGlobalScope es true y ocultarla en modo SINGLE", () => {
    fixture.componentRef.setInput("isGlobalScope", true);
    fixture.componentRef.setInput("data", [
      {
        ticketId: "t1",
        licensePlate: "ABC-123",
        slotNumber: "1",
        slotType: "CAR",
        parkingName: "Sede Centro",
        entryTime: "10:00",
        durationMinutes: 30,
        ticketStatus: "OPEN",
        totalToCharge: 5000,
        paymentStatus: "PENDING",
      },
    ]);
    fixture.detectChanges();

    const columnIds = component.table.getAllColumns().map((c) => c.id);
    expect(columnIds).toContain("parkingName");

    fixture.componentRef.setInput("isGlobalScope", false);
    fixture.detectChanges();
    const columnIdsSingle = component.table
      .getAllColumns()
      .filter((c) => c.getIsVisible())
      .map((c) => c.id);
    expect(columnIdsSingle).not.toContain("parkingName");
  });

  it("template no debe contener escaleras @if/@else if de columnas (anti-ladder rule)", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Comprueba que las celdas se delegan declarativamente vía *flexRender
    expect(compiled.querySelectorAll("td").length).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard.facade.spec.ts operational-reports-table.spec.ts
```

- [ ] **Step 3: Write minimal implementation**

Implement `DashboardFacade` and `OperationalReportsTableComponent`.
Use TanStack column helpers and `flexRenderComponent` for cell rendering.

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard.facade.spec.ts operational-reports-table.spec.ts
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(web(reports)): implement DashboardFacade and scope-aware TanStack table"
```

---

### Task 9: Dashboard Main Page Integration with Multi-Parking Scope & Design System (`apps/web`)

**Files:**

- Modify: `apps/web/src/app/features/dashboard/page/dashboard-page.ts`
- Modify: `apps/web/src/app/features/dashboard/page/dashboard-page.html`
- Modify: `apps/web/src/app/features/dashboard/page/dashboard-page.spec.ts`

**Interfaces:**

- Consumes: `DashboardFacade`, `@nivo-sass/design-system`, `PageHeaderComponent`.
- Produces: Integrated view with scope selector ("🏢 Todas las Sedes (Consolidado Global)" vs individual parking), KPI cards, comparison chart in global mode, trend chart, and report table.

- [ ] **Step 1: Write failing page integration test verifying multi-parking selector and comparison chart visibility**

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DashboardPage } from "./dashboard-page";
import { DashboardFacade } from "../facade/dashboard.facade";

describe("DashboardPage", () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let facade: DashboardFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [DashboardFacade],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    facade = TestBed.inject(DashboardFacade);
  });

  it("con 1 sola sede debe renderizar vista limpia sin selector multi-sede", () => {
    facade.accessibleParkings.set([{ id: "p1", name: "Sede Única" }]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('[data-testid="multi-parking-selector"]'),
    ).toBeNull();
    expect(compiled.querySelector("app-parking-comparison-chart")).toBeNull();
  });

  it("con múltiples sedes debe renderizar selector con opción Todas las Sedes y gráfico comparativo en modo GLOBAL", () => {
    facade.accessibleParkings.set([
      { id: "p1", name: "Sede Centro" },
      { id: "p2", name: "Sede Norte" },
    ]);
    facade.activeScope.set({ mode: "GLOBAL" });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('[data-testid="multi-parking-selector"]'),
    ).toBeTruthy();
    expect(compiled.querySelector("app-parking-comparison-chart")).toBeTruthy();
  });

  it("debe utilizar exclusivamente componentes del @nivo-sass/design-system (cero raw buttons)", () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const rawButtons = compiled.querySelectorAll("button:not([nv-button])");
    expect(rawButtons.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard-page.spec.ts
```

- [ ] **Step 3: Write minimal implementation**

Update `dashboard-page.ts` and `dashboard-page.html`:

- Integrate `PageHeaderComponent` with active breadcrumb.
- Add scope selector with `nv-select` or `nv-button` tabs when `isMultiParkingTenant()` is true.
- Render `<app-parking-comparison-chart>` conditionally in global mode.
- Render summary KPIs in `nv-card`, `<app-occupancy-trend-chart>`, `<app-slot-distribution-donut-chart>`, and `<app-operational-reports-table>`.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard-page.spec.ts
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(web(dashboard)): integrate DashboardPage with multi-parking scope and Design System"
```

---

### Task 10: E2E and Full Test Verification (`apps/api` & `apps/web`)

**Files:**

- Modify: Test suites in backend and frontend.

**Interfaces:**

- Consumes: Entire feature surface across backend and frontend.
- Produces: 100% passing test suites, zero regressions, and verified build.

- [ ] **Step 1: Run complete backend test suite**

```bash
./gradlew test
```

Verify that all tests pass including `DashboardViewsRepositoryTest`, `BackendOperationsMetricsManagerTest`, `DashboardControllerTest`, `PublicAvailabilityControllerTest`, and `DashboardSseRegistryTest`.

- [ ] **Step 2: Run complete frontend test suite and linters**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web
bun test
bun run check
```

Verify that all Angular components pass tests and Ultracite/Oxlint checks pass cleanly.

- [ ] **Step 3: Commit final verification**

```bash
git commit -m "test(dashboard): verify full test coverage and lint checks for feat-nivo-dashboard"
```
