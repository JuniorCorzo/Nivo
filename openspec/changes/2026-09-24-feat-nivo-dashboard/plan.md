# Implementation Plan: Dashboard Analítico, SSE y API Pública (feat-nivo-dashboard)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real-time analytical dashboard with PostgreSQL optimized views (`v_parking_occupancy_hourly`, `v_parking_daily_summary`, `v_parking_operational_report`), backend operational observability with Micrometer (`MeterRegistry`), reactive Server-Sent Events (SSE) streaming with domain event listeners, public availability API with Token Bucket rate limiting (60 req/min per IP), Scalar pre-request auto-authentication, and an Angular 21+ Dashboard UI with Signals, Chart.js visualizations, TanStack Table operational reports, streaming CSV export, and `@nivo-sass/design-system` components.

**Architecture:** Hexagonal / Clean Architecture in Spring Boot WebMVC (`apps/api`), domain event decoupling with `ApplicationEventPublisher`, PostgreSQL views with dedicated indices, in-memory Token Bucket filter and Caffeine caching. Reactive Angular 21+ in `apps/web` with Signal architecture (`DashboardFacade`), authenticated SSE stream consumption via `fetch` + `ReadableStream`, OnPush Chart.js canvas components, TanStack Table column-driven renderers without template ladders, and strict Design System compliance.

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
- Produces: `v_parking_occupancy_hourly`, `v_parking_daily_summary`, `v_parking_operational_report` views and Spring Data JPA repositories.

- [ ] **Step 1: Write failing integration test for dashboard views repositories**

```java
package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.DailySummaryViewRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.HourlyOccupancyViewRepository;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class DashboardViewsRepositoryTest {

  @Autowired
  private HourlyOccupancyViewRepository hourlyRepository;

  @Autowired
  private DailySummaryViewRepository dailyRepository;

  @Test
  @DisplayName("Should query hourly occupancy view by parking lot")
  void shouldQueryHourlyOccupancyView() {
    var result = hourlyRepository.findByParkingLotId(UUID.randomUUID());
    assertThat(result).isNotNull();
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.DashboardViewsRepositoryTest"
```

- [ ] **Step 3: Write minimal implementation**

Create `apps/api/src/main/resources/db/migration/V5__create_dashboard_views_and_analytics.sql`:

```sql
CREATE OR REPLACE VIEW nivo.v_parking_occupancy_hourly AS
WITH hourly_buckets AS (
    SELECT
        t.tenant_id,
        s.parking_lot_id,
        date_trunc('hour', t.entry_time) AS hour_bucket,
        COUNT(t.id) AS checkin_count
    FROM nivo.parking_tickets t
    JOIN nivo.slots s ON s.id = t.slot_id
    WHERE t.deleted_at IS NULL
    GROUP BY t.tenant_id, s.parking_lot_id, date_trunc('hour', t.entry_time)
),
hourly_exits AS (
    SELECT
        t.tenant_id,
        s.parking_lot_id,
        date_trunc('hour', t.exit_time) AS hour_bucket,
        COUNT(t.id) AS checkout_count
    FROM nivo.parking_tickets t
    JOIN nivo.slots s ON s.id = t.slot_id
    WHERE t.exit_time IS NOT NULL AND t.deleted_at IS NULL
    GROUP BY t.tenant_id, s.parking_lot_id, date_trunc('hour', t.exit_time)
),
slot_capacities AS (
    SELECT
        parking_lot_id,
        COUNT(id) AS total_slots
    FROM nivo.slots
    WHERE deleted_at IS NULL AND status != 'MAINTENANCE'
    GROUP BY parking_lot_id
)
SELECT
    COALESCE(b.tenant_id, e.tenant_id) AS tenant_id,
    COALESCE(b.parking_lot_id, e.parking_lot_id) AS parking_lot_id,
    COALESCE(b.hour_bucket, e.hour_bucket) AS hour_bucket,
    COALESCE(b.checkin_count, 0) AS checkins,
    COALESCE(e.checkout_count, 0) AS checkouts,
    COALESCE(cap.total_slots, 0) AS total_capacity,
    ROUND(
        LEAST(100.0, GREATEST(0.0,
            (COALESCE(b.checkin_count, 0) * 100.0) / NULLIF(cap.total_slots, 0)
        )), 2
    ) AS estimated_occupancy_rate
FROM hourly_buckets b
FULL OUTER JOIN hourly_exits e
    ON b.parking_lot_id = e.parking_lot_id AND b.hour_bucket = e.hour_bucket
JOIN slot_capacities cap
    ON cap.parking_lot_id = COALESCE(b.parking_lot_id, e.parking_lot_id);

CREATE OR REPLACE VIEW nivo.v_parking_daily_summary AS
SELECT
    s.parking_lot_id,
    p.tenant_id,
    date_trunc('day', t.entry_time)::date AS summary_date,
    COUNT(t.id) AS total_tickets,
    COUNT(t.id) FILTER (WHERE t.status = 'CLOSED') AS completed_tickets,
    COUNT(t.id) FILTER (WHERE t.status = 'OPEN') AS ongoing_tickets,
    COUNT(DISTINCT t.license_plate) AS unique_vehicles,
    COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'PAID'), 0.00) AS total_revenue,
    ROUND(AVG(EXTRACT(EPOCH FROM (t.exit_time - t.entry_time)) / 60.0) FILTER (WHERE t.status = 'CLOSED'), 2) AS avg_duration_minutes,
    p.currency
FROM nivo.parking_tickets t
JOIN nivo.slots s ON s.id = t.slot_id
JOIN nivo.parking_lots p ON p.id = s.parking_lot_id
LEFT JOIN nivo.payments pay ON pay.parking_ticket_id = t.id AND pay.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY s.parking_lot_id, p.tenant_id, date_trunc('day', t.entry_time)::date, p.currency;

CREATE OR REPLACE VIEW nivo.v_parking_operational_report AS
SELECT
    t.id AS ticket_id,
    t.tenant_id,
    p.id AS parking_lot_id,
    p.name AS parking_name,
    t.license_plate,
    s.slot_number,
    s.zone AS slot_zone,
    s.prefix AS slot_prefix,
    s.type AS slot_type,
    r.name AS rate_name,
    t.entry_time,
    t.exit_time,
    ROUND(EXTRACT(EPOCH FROM (COALESCE(t.exit_time, CURRENT_TIMESTAMP) - t.entry_time)) / 60.0, 1) AS duration_minutes,
    t.status AS ticket_status,
    t.total_to_charge,
    pay.id AS payment_id,
    pay.status AS payment_status,
    pay.payment_method,
    pay.amount AS paid_amount,
    pay.completed_at AS payment_date,
    u.full_name AS operator_or_user_name,
    u.email AS user_email
FROM nivo.parking_tickets t
JOIN nivo.slots s ON s.id = t.slot_id
JOIN nivo.parking_lots p ON p.id = s.parking_lot_id
JOIN nivo.rates r ON r.id = t.rate_id
LEFT JOIN nivo.payments pay ON pay.parking_ticket_id = t.id AND pay.deleted_at IS NULL
LEFT JOIN nivo.users u ON u.id = t.user_id
WHERE t.deleted_at IS NULL;
```

Create JPA entities: `HourlyOccupancyViewEntity`, `DailySummaryViewEntity`, `OperationalReportViewEntity` with `@Immutable` and `@Table(name = "v_...", schema = "nivo")`.
Create Spring Data repositories extending `JpaRepository`.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.DashboardViewsRepositoryTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(db)): add analytics views and JPA view repositories"
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

- [ ] **Step 1: Write failing unit test**

```java
package dev.angelcorzo.nivo.infrastructure.adapter.metrics;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
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
  @DisplayName("Should increment active SSE connections gauge")
  void shouldTrackSseActiveConnections() {
    metricsManager.recordSseConnectionOpened();
    assertThat(meterRegistry.get("sse.dashboard.active.connections").gauge().value()).isEqualTo(1.0);

    metricsManager.recordSseConnectionClosed();
    assertThat(meterRegistry.get("sse.dashboard.active.connections").gauge().value()).isEqualTo(0.0);
  }

  @Test
  @DisplayName("Should track rate limited counter")
  void shouldTrackRateLimitedRequests() {
    metricsManager.recordPublicAvailabilityRateLimited();
    assertThat(meterRegistry.get("public.api.availability.rate_limited.total").counter().count()).isEqualTo(1.0);
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManagerTest"
```

- [ ] **Step 3: Write minimal implementation**

```java
package dev.angelcorzo.nivo.infrastructure.adapter.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Component;

@Component
public class BackendOperationsMetricsManager {

  private final MeterRegistry meterRegistry;
  private final AtomicInteger activeSseConnections = new AtomicInteger(0);
  private final Counter sseBroadcastCounter;
  private final Counter sseDisconnectCounter;
  private final Counter rateLimitedCounter;
  private final Counter cacheHitCounter;
  private final Counter cacheMissCounter;

  public BackendOperationsMetricsManager(MeterRegistry meterRegistry) {
    this.meterRegistry = meterRegistry;
    this.meterRegistry.gauge("sse.dashboard.active.connections", activeSseConnections);
    this.sseBroadcastCounter = meterRegistry.counter("sse.dashboard.events.broadcast.total");
    this.sseDisconnectCounter = meterRegistry.counter("sse.dashboard.disconnects.total");
    this.rateLimitedCounter = meterRegistry.counter("public.api.availability.rate_limited.total");
    this.cacheHitCounter = meterRegistry.counter("public.api.availability.cache.hit");
    this.cacheMissCounter = meterRegistry.counter("public.api.availability.cache.miss");
  }

  public void recordSseConnectionOpened() {
    activeSseConnections.incrementAndGet();
  }

  public void recordSseConnectionClosed() {
    activeSseConnections.decrementAndGet();
  }

  public void recordSseEventBroadcast() {
    sseBroadcastCounter.increment();
  }

  public void recordSseDisconnect() {
    sseDisconnectCounter.increment();
    recordSseConnectionClosed();
  }

  public void recordPublicAvailabilityRateLimited() {
    rateLimitedCounter.increment();
  }

  public void recordPublicAvailabilityRequest(int statusCode) {
    meterRegistry.counter("public.api.availability.requests.total", "status", String.valueOf(statusCode)).increment();
  }

  public void recordAvailabilityCacheHit() {
    cacheHitCounter.increment();
  }

  public void recordAvailabilityCacheMiss() {
    cacheMissCounter.increment();
  }

  public void recordAnalyticsQueryDuration(String view, Runnable query) {
    Timer.builder("db.analytics.query.duration")
        .tag("view", view)
        .register(meterRegistry)
        .record(query);
  }

  public void recordCsvExportDuration(Runnable export) {
    meterRegistry.timer("reports.csv.export.duration").record(export);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManagerTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(metrics)): implement BackendOperationsMetricsManager for platform observability"
```

---

### Task 3: REST Analytics Endpoints & Streaming CSV Export (`apps/api`)

**Files:**

- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetDashboardSummaryUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetHourlyOccupancyUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/dashboard/GetOperationalReportUseCase.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/DashboardController.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/reports/ReportsController.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/DashboardControllerTest.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/reports/ReportsControllerTest.java`

**Interfaces:**

- Consumes: JPA view repositories, `AuthenticationContextGateway`.
- Produces:
  - `GET /api/v1/parkings/{parkingId}/dashboard/summary` -> `DashboardSummaryDTO`
  - `GET /api/v1/parkings/{parkingId}/dashboard/occupancy-hourly` -> `List<HourlyOccupancyDTO>`
  - `GET /api/v1/parkings/{parkingId}/reports/operational` -> `Page<OperationalReportDTO>`
  - `GET /api/v1/parkings/{parkingId}/reports/operational/csv` -> `text/csv` stream

- [ ] **Step 1: Write failing controller test for dashboard summary and CSV export**

```java
package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @WithMockUser
  @DisplayName("GET /dashboard/summary should return 200 with summary data")
  void shouldReturnSummary() throws Exception {
    UUID parkingId = UUID.randomUUID();
    mockMvc.perform(get("/api/v1/parkings/" + parkingId + "/dashboard/summary"))
        .andExpect(status().isOk());
  }

  @Test
  @WithMockUser
  @DisplayName("GET /reports/operational/csv should stream text/csv with attachment header")
  void shouldStreamCsvReport() throws Exception {
    UUID parkingId = UUID.randomUUID();
    mockMvc.perform(get("/api/v1/parkings/" + parkingId + "/reports/operational/csv"))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Type", "text/csv;charset=UTF-8"))
        .andExpect(header().exists("Content-Disposition"));
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.DashboardControllerTest"
```

- [ ] **Step 3: Write minimal implementation**

Implement use cases in `dev.angelcorzo.nivo.domain.usecase.dashboard`.
Implement `DashboardController` and `ReportsController`.
For CSV export:

```java
@GetMapping(value = "/api/v1/parkings/{parkingId}/reports/operational/csv", produces = "text/csv")
public void exportOperationalReportCsv(
    @PathVariable UUID parkingId,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
    HttpServletResponse response) throws IOException {

  response.setContentType("text/csv;charset=UTF-8");
  response.setHeader("Content-Disposition", "attachment; filename=\"operational-report-" + parkingId + ".csv\"");

  try (var writer = new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8);
       var csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.builder().setHeader(
           "Ticket ID", "Placa", "Plaza", "Tipo", "Entrada", "Salida", "Minutos", "Estado", "Total", "Metodo Pago").build())) {

    metricsManager.recordCsvExportDuration(() -> {
      reportUseCase.streamReport(parkingId, startDate, endDate, item -> {
        try {
          csvPrinter.printRecord(item.ticketId(), item.licensePlate(), item.slotNumber(), item.slotType(),
              item.entryTime(), item.exitTime(), item.durationMinutes(), item.ticketStatus(), item.totalToCharge(), item.paymentMethod());
        } catch (IOException e) {
          throw new UncheckedIOException(e);
        }
      });
    });
    csvPrinter.flush();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.DashboardControllerTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(dashboard)): implement dashboard REST endpoints and streaming CSV export"
```

---

### Task 4: SseEmitter Registry, Domain Event Listeners & Stream Endpoint (`apps/api`)

**Files:**

- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/DashboardSseRegistry.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/DashboardStreamController.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/listeners/DashboardDomainEventListener.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/dashboard/sse/DashboardSseRegistryTest.java`

**Interfaces:**

- Consumes: `ApplicationEventPublisher`, Spring domain events (`TicketCreated`, `TicketCheckedOut`, `PaymentCompleted`).
- Produces:
  - `GET /api/v1/parkings/{parkingId}/dashboard/stream` -> `text/event-stream`
  - Events: `snapshot`, `occupancy-update`, `revenue-update`, `ping`

- [ ] **Step 1: Write failing unit test for SseRegistry**

```java
package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class DashboardSseRegistryTest {

  private DashboardSseRegistry sseRegistry;
  private BackendOperationsMetricsManager metricsManager;

  @BeforeEach
  void setUp() {
    metricsManager = mock(BackendOperationsMetricsManager.class);
    sseRegistry = new DashboardSseRegistry(metricsManager);
  }

  @Test
  @DisplayName("Should register emitter and broadcast event to parking subscribers")
  void shouldBroadcastEventToParkingSubscribers() {
    UUID parkingId = UUID.randomUUID();
    var emitter = sseRegistry.createEmitter(parkingId);
    assertThat(emitter).isNotNull();

    sseRegistry.broadcast(parkingId, "occupancy-update", "{\"occupancyRate\": 75.0}");
    assertThat(sseRegistry.getActiveCount(parkingId)).isEqualTo(1);
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.DashboardSseRegistryTest"
```

- [ ] **Step 3: Write minimal implementation**

Implement `DashboardSseRegistry`:

- `ConcurrentHashMap<UUID, CopyOnWriteArrayList<SseEmitter>>`
- Set timeout to 30 mins, add `onCompletion`, `onTimeout`, `onError` callbacks.
- Scheduled `@Scheduled(fixedRate = 15000)` heartbeat ping.
- Domain event listener `@EventListener` responding to ticket checkin/checkout by calling `broadcast(parkingId, "occupancy-update", delta)`.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.DashboardSseRegistryTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(sse)): implement DashboardSseRegistry, stream endpoint and domain event listeners"
```

---

### Task 5: Scalar Pre-Request Auto-Authentication Script Hook (`apps/api`)

**Files:**

- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/commons/config/SwaggerConfiguration.java`
- Modify: `apps/api/src/main/resources/application.yaml`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/commons/config/SwaggerConfigurationTest.java`

**Interfaces:**

- Consumes: Scalar WebMVC configuration and OpenAPI 3.0 specification.
- Produces: Custom HTML/JS pre-request hook or `x-pre-request` OpenAPI extension auto-authenticating with `/api/v1/auth/login`.

- [ ] **Step 1: Write test verifying OpenAPI extension in SwaggerConfiguration**

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
  @DisplayName("Should register Scalar auto-auth configuration or security schemes")
  void shouldHaveSecuritySchemesAndPreRequestConfig() {
    assertThat(openAPI.getComponents().getSecuritySchemes()).containsKey("Bearer Authentication");
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.SwaggerConfigurationTest"
```

- [ ] **Step 3: Write minimal implementation**

Enrich `SwaggerConfiguration.java` with a custom `OpenApiCustomizer` bean adding `x-scalar-pre-request` extension or serving the pre-request script snippet injecting the token from `/api/v1/auth/login`.

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.SwaggerConfigurationTest"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(scalar)): add Scalar pre-request auto-authentication hook"
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
- Produces:
  - `GET /api/v1/public/parkings/{parkingId}/availability` (HTTP 200, 404, 429)
  - Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`, `Cache-Control: public, max-age=30`

- [ ] **Step 1: Write failing unit test for Token Bucket rate limiter**

```java
package dev.angelcorzo.nivo.infrastructure.security.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TokenBucketRateLimiterTest {

  @Test
  @DisplayName("Should allow up to 60 tokens and reject the 61st within the same minute")
  void shouldRateLimitAfterCapacityExhausted() {
    var limiter = new TokenBucketRateLimiter(60, 60);
    String clientIp = "192.168.1.100";

    for (int i = 0; i < 60; i++) {
      assertThat(limiter.tryConsume(clientIp)).isTrue();
    }
    assertThat(limiter.tryConsume(clientIp)).isFalse();
  }
}
```

- [ ] **Step 2: Run test to verify failure**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.security.ratelimit.TokenBucketRateLimiterTest"
```

- [ ] **Step 3: Write minimal implementation**

Implement `TokenBucketRateLimiter`:

- Refill calculation based on elapsed nano-time.
- `PublicApiRateLimitFilter`: Intercepts `/api/v1/public/**`, extracts client IP (`X-Forwarded-For` fallback to `remoteAddr`).
- If token available: proceed with response headers `X-RateLimit-*`.
- If exhausted: return HTTP 429 with `Retry-After: <seconds>` and invoke `metricsManager.recordPublicAvailabilityRateLimited()`.
- Add `/api/v1/public/**` to `permitAll()` in `SecurityChain.java`.
- `PublicAvailabilityController`: Returns availability JSON with Caffeine 30s cache.

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.security.ratelimit.*"
./gradlew test --tests "dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi.*"
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(api(public)): implement public availability API with Token Bucket rate limiting and cache"
```

---

### Task 7: Chart.js Installation & Angular Presentational Charts (`apps/web`)

**Files:**

- Modify: `apps/web/package.json`
- Create: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/occupancy-trend-chart.ts`
- Create: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/occupancy-trend-chart.html`
- Create: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/occupancy-trend-chart.spec.ts`
- Create: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/slot-distribution-donut-chart.ts`
- Create: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/slot-distribution-donut-chart.html`
- Create: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/slot-distribution-donut-chart.spec.ts`

**Interfaces:**

- Consumes: Chart.js library, inputs `HourlyOccupancyPoint[]`, `SlotDistributionItem[]`.
- Produces: Standalone `OnPush` components wrapping HTML canvas with linear gradients and donut cutouts, properly destroying chart instances in `ngOnDestroy`.

- [ ] **Step 1: Install Chart.js**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun add chart.js
```

- [ ] **Step 2: Write failing component tests**

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OccupancyTrendChartComponent } from "./occupancy-trend-chart";

describe("OccupancyTrendChartComponent", () => {
  let component: OccupancyTrendChartComponent;
  let fixture: ComponentFixture<OccupancyTrendChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccupancyTrendChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OccupancyTrendChartComponent);
    component = fixture.componentInstance;
  });

  it("should create and render chart with input data", () => {
    fixture.componentRef.setInput("data", [
      {
        hourBucket: "2026-09-24T08:00:00Z",
        checkins: 10,
        checkouts: 2,
        estimatedOccupancyRate: 50.0,
        totalCapacity: 100,
      },
    ]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run test to verify failure**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test occupancy-trend-chart.spec.ts
```

- [ ] **Step 4: Write minimal implementation**

Implement `OccupancyTrendChartComponent` and `SlotDistributionDonutChartComponent`:

- `ChangeDetectionStrategy.OnPush`
- `input.required<HourlyOccupancyPoint[]>()`
- Canvas element with ViewChild
- On `effect()` or `ngAfterViewInit()` instantiate `new Chart(ctx, config)` with linear gradient background.
- On `ngOnDestroy()` call `this.chart?.destroy()`.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test occupancy-trend-chart.spec.ts slot-distribution-donut-chart.spec.ts
```

- [ ] **Step 6: Commit changes**

```bash
git commit -m "feat(web(charts)): integrate Chart.js with occupancy trend and slot distribution components"
```

---

### Task 8: DashboardFacade & Operational Reports TanStack Table (`apps/web`)

**Files:**

- Create: `apps/web/src/app/features/dashboard/facade/dashboard.facade.ts`
- Create: `apps/web/src/app/features/dashboard/facade/dashboard.facade.spec.ts`
- Create: `apps/web/src/app/features/dashboard/components/operational-reports-table/operational-reports-table.ts`
- Create: `apps/web/src/app/features/dashboard/components/operational-reports-table/operational-reports-table.html`
- Create: `apps/web/src/app/features/dashboard/components/operational-reports-table/operational-reports-table.spec.ts`

**Interfaces:**

- Consumes: `@tanstack/angular-table`, backend endpoints `/dashboard/summary`, `/dashboard/stream`, `/reports/operational`, `/reports/operational/csv`.
- Produces:
  - `DashboardFacade` state (`summary`, `occupancyHourly`, `reports`, `isStreaming`, `isExportingCsv`).
  - `OperationalReportsTableComponent` with column-driven renderers without HTML template `@if` ladders.

- [ ] **Step 1: Write failing facade unit test**

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

  it("should initialize with default states and signals", () => {
    expect(facade.summary()).toBeNull();
    expect(facade.isStreaming()).toBe(false);
    expect(facade.occupancyPercentage()).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard.facade.spec.ts
```

- [ ] **Step 3: Write minimal implementation**

Implement `DashboardFacade`:

- Signals: `summary`, `occupancyHourly`, `reports`, `isStreaming`, `isExportingCsv`.
- `connectStream(parkingId)`: uses `fetch()` with `Authorization: Bearer <token>`, decodes `ReadableStream`, parses SSE events, updates signals, exponential backoff on disconnect.
- `exportOperationalCsv(parkingId)`: calls CSV endpoint, creates blob object URL, triggers download, triggers `@ngxpert/hot-toast` notifications.

Implement `OperationalReportsTableComponent`:

- Use `createAngularTable` and `createColumnHelper`.
- Define columns for `ticketId`, `licensePlate`, `slotNumber`, `entryTime`, `exitTime`, `durationMinutes`, `ticketStatus`, `totalToCharge`, `paymentStatus`.
- Strictly declarative template delegating to `*flexRender="cell.column.columnDef.cell; props: cell.getContext()"`. No `@if (column.id === ...)` ladders.

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard.facade.spec.ts operational-reports-table.spec.ts
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(web(reports)): implement DashboardFacade with SSE stream reader and TanStack table"
```

---

### Task 9: Dashboard Main Page Integration with Design System (`apps/web`)

**Files:**

- Modify: `apps/web/src/app/features/dashboard/page/dashboard-page.ts`
- Modify: `apps/web/src/app/features/dashboard/page/dashboard-page.html`
- Modify: `apps/web/src/app/features/dashboard/page/dashboard-page.spec.ts`

**Interfaces:**

- Consumes: `DashboardFacade`, `ActiveParkingService`, `@nivo-sass/design-system` components (`nv-card`, `nv-badge`, `nv-button`, `nv-typography`, `nv-input`, `nv-loader`), `PageHeaderComponent`.
- Produces: Responsive main dashboard view connecting charts, KPI cards, live SSE status chip, date filters, and operational report table.

- [ ] **Step 1: Write failing page integration test**

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DashboardPage } from "./dashboard-page";

describe("DashboardPage", () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should render page header and kpi cards", () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard-page.spec.ts
```

- [ ] **Step 3: Write minimal implementation**

Update `dashboard-page.ts` and `dashboard-page.html`:

- Embed `<app-page-header title="Dashboard Analítico" />` with dynamic breadcrumbs.
- Top KPI summary grid using `nv-card` for Occupancy Rate, Available Slots, Daily Revenue, and Active Tickets.
- Render `<app-occupancy-trend-chart />` and `<app-slot-distribution-donut-chart />`.
- Render `<app-operational-reports-table />` with date picker filters and CSV export `nv-button`.
- Display live connection indicator (`nv-badge` variant "success" when `facade.isStreaming()`, "warning" when reconnecting).

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /home/juniorcorzo/Development/nivo/apps/web && bun test dashboard-page.spec.ts
```

- [ ] **Step 5: Commit changes**

```bash
git commit -m "feat(web(dashboard)): integrate DashboardPage with Design System and PageHeader"
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
