# Diseño Técnico: Dashboard Analítico, Métricas en Tiempo Real y API Pública de Disponibilidad

## 1. Arquitectura General y Diagrama de Componentes

La arquitectura de `feat-nivo-dashboard` integra analítica de baja latencia con soporte dual de ámbito (**Sede Individual** vs. **Consolidado Global Multi-Sede** a nivel de Tenant), telemetría operativa en Prometheus, streaming reactivo Server-Sent Events (SSE) y un canal público de disponibilidad protegido por Token Bucket.

```mermaid
flowchart TD
    subgraph ClientLayer["Capa Cliente & Consumidores"]
        NavApps["Apps de Navegación (Waze, Maps, 3rd Party)"]
        ScalarDoc["Scalar OpenAPI Explorer (/scalar)"]
        AngularApp["Angular 21+ Web App (/dashboard)"]
    end

    subgraph ApiGatewaySec["Seguridad y Control de Acceso (Spring Security)"]
        RateLimiter["Token Bucket Rate Limiter Filter (60 req/min por IP)"]
        JwtFilter["JWT Authentication & Multi-Tenant Context Filter"]
        ScalarAuth["Scalar Pre-Request Auto-Auth Interceptor"]
    end

    subgraph SpringBackend["Spring Boot WebMVC Backend"]
        PublicCtrl["PublicAvailabilityController (/api/v1/public/parkings/{id}/availability)"]
        DashCtrl["DashboardController (/api/v1/dashboard/*?parkingId={optionalUUID})"]
        ReportCtrl["ReportsController (/api/v1/reports/*?parkingId={optionalUUID})"]
        SseManager["DashboardSseManager (SseEmitter Multi-Tenant Registry & Heartbeat)"]
        MetricsService["BackendOperationsMetricsManager (MeterRegistry)"]
        EventBus["Spring Domain EventBus / ApplicationEventPublisher"]
    end

    subgraph PersistenceLayer["Capa de Persistencia & Base de Datos (PostgreSQL)"]
        BaseTables[("Tablas: slots, parking_tickets, payments, parking_lots")]
        ViewHourly[("Vista: v_parking_occupancy_hourly")]
        ViewDaily[("Vista: v_parking_daily_summary")]
        ViewReport[("Vista: v_parking_operational_report")]
    end

    subgraph Observability["Monitoreo y Métricas"]
        PrometheusActuator["Actuator Prometheus Endpoint (/actuator/prometheus)"]
    end

    NavApps -->|HTTP GET /availability| RateLimiter
    RateLimiter --> PublicCtrl
    ScalarDoc -->|Auto Bearer Token| ScalarAuth
    ScalarAuth --> JwtFilter
    AngularApp -->|JWT Bearer REST con ?parkingId={optional}| JwtFilter
    AngularApp -->|SSE ReadableStream Bearer (?parkingId={optional})| SseManager

    JwtFilter --> DashCtrl
    JwtFilter --> ReportCtrl

    PublicCtrl --> ViewHourly
    PublicCtrl --> ViewDaily
    DashCtrl --> ViewHourly
    DashCtrl --> ViewDaily
    ReportCtrl --> ViewReport
    ReportCtrl -->|Streaming CSV Output| AngularApp

    BaseTables --> ViewHourly
    BaseTables --> ViewDaily
    BaseTables --> ViewReport

    EventBus -->|Checkin / Checkout / PaymentCompleted| SseManager
    EventBus -->|Eventos Operativos de Infraestructura| MetricsService
    MetricsService --> PrometheusActuator
    SseManager -.->|Push Event: occupancy-update (Tenant o Parking)| AngularApp
```

---

## 2. Vistas en PostgreSQL (Modelado de Datos Analítico Multi-Sede)

Para garantizar latencias de respuesta inferiores a 200ms en el endpoint público y 500ms en consultas agregadas del dashboard —tanto para una sede puntual como para el consolidado global de un tenant con múltiples sedes—, se introducen tres vistas optimizadas en la migración Flyway `V5__create_dashboard_views_and_analytics.sql`:

### 2.1 `v_parking_occupancy_hourly`

Calcula la serie temporal horaria de entradas, salidas y ocupación pico por parqueadero y tramo horario:

```sql
CREATE OR REPLACE VIEW nivo.v_parking_occupancy_hourly AS
WITH hourly_buckets AS (
    SELECT
        t.tenant_id,
        s.parking_lot_id,
        date_trunc('hour', t.entry_time) AS hour_bucket,
        COUNT(t.id) AS checkin_count,
        COUNT(t.id) FILTER (WHERE t.exit_time IS NOT NULL AND date_trunc('hour', t.exit_time) = date_trunc('hour', t.entry_time)) AS checkout_same_hour,
        AVG(CASE WHEN t.status = 'OPEN' THEN 1.0 ELSE 0.0 END) AS active_ratio
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
    cap.total_slots AS total_capacity,
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
```

**Estrategia de Consulta**:

- **Por Sede Específica**: `SELECT ... FROM v_parking_occupancy_hourly WHERE tenant_id = :tenantId AND parking_lot_id = :parkingId`
- **Consolidado Multi-Sede (Tenant Scope)**: `SELECT tenant_id, hour_bucket, SUM(checkins) AS checkins, SUM(checkouts) AS checkouts, SUM(total_capacity) AS total_capacity, ROUND(SUM(checkins) * 100.0 / NULLIF(SUM(total_capacity), 0), 2) AS estimated_occupancy_rate FROM v_parking_occupancy_hourly WHERE tenant_id = :tenantId GROUP BY tenant_id, hour_bucket ORDER BY hour_bucket ASC`

### 2.2 `v_parking_daily_summary`

Proporciona KPIs consolidados diarios de volumen vehicular, facturación total recaudada, tiempo promedio de estadía y rotación por sede:

```sql
CREATE OR REPLACE VIEW nivo.v_parking_daily_summary AS
SELECT
    s.parking_lot_id,
    p.tenant_id,
    p.name AS parking_name,
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
GROUP BY s.parking_lot_id, p.tenant_id, p.name, date_trunc('day', t.entry_time)::date, p.currency;
```

### 2.3 `v_parking_operational_report`

Vista desnormalizada preparada para listado paginado en tablas web y descarga continua por streaming CSV:

```sql
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

### 2.4 Índices de Soporte Multi-Tenant Compuestos

```sql
CREATE INDEX IF NOT EXISTS idx_parking_tickets_tenant_entry
    ON nivo.parking_tickets (tenant_id, entry_time) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_parking_tickets_tenant_exit
    ON nivo.parking_tickets (tenant_id, exit_time) WHERE exit_time IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_slots_tenant_parking_status
    ON nivo.slots (tenant_id, parking_lot_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payments_ticket_status
    ON nivo.payments (parking_ticket_id, status) WHERE deleted_at IS NULL;
```

---

## 3. Observabilidad y Telemetría Operativa con Micrometer (`MeterRegistry`)

Para mantener un rendimiento óptimo de monitoreo y cumplir las mejores prácticas en sistemas multi-tenant, se establece una separación arquitectónica estricta:

- **Analítica de Negocio del Tenant**: Los KPIs comerciales y operativos (% de ocupación en vivo, plazas libres vs. ocupadas, facturación acumulada del día y tiempos promedio de estancia) residen en las vistas de PostgreSQL (`v_parking_daily_summary`, `v_parking_occupancy_hourly`) y son consumidos por los clientes vía REST y transmitidos reactivamente mediante SSE. No se almacenan en Prometheus como métricas etiquetadas por cliente.
- **Telemetría Operativa de Plataforma**: `BackendOperationsMetricsManager` instrumenta exclusivamente métricas de salud, rendimiento, latencias y consumo de recursos del backend, eliminando etiquetas de alta cardinalidad (`parkingId`, `tenantId`, `licensePlate`) para proteger a Prometheus de la explosión dimensional de series temporales.

### 3.1 Catálogo de Métricas Operativas

| Métrica                                      | Tipo    | Etiquetas (Tags)                  | Descripción                                                         |
| :------------------------------------------- | :------ | :-------------------------------- | :------------------------------------------------------------------ |
| `sse.dashboard.active.connections`           | Gauge   | _(ninguna)_                       | Conexiones SSE concurrentes activas en el servidor.                 |
| `sse.dashboard.events.broadcast.total`       | Counter | _(ninguna)_                       | Total acumulado de eventos SSE transmitidos hacia clientes.         |
| `sse.dashboard.disconnects.total`            | Counter | _(ninguna)_                       | Total de desconexiones SSE (timeout, cierre de cliente o error).    |
| `db.analytics.query.duration`                | Timer   | `view` (`hourly`, `daily`, `ops`) | Latencia de ejecución de consultas sobre vistas SQL de analítica.   |
| `public.api.availability.requests.total`     | Counter | `status` (`200`, `404`, `429`)    | Volumen de peticiones entrantes a la API pública de disponibilidad. |
| `public.api.availability.rate_limited.total` | Counter | _(ninguna)_                       | Peticiones bloqueadas preventivamente por el filtro Token Bucket.   |
| `public.api.availability.latency`            | Timer   | _(ninguna)_                       | Latencia de respuesta en el endpoint público de disponibilidad.     |
| `public.api.availability.cache.hit`          | Counter | _(ninguna)_                       | Aciertos en la caché en memoria (Caffeine) de disponibilidad.       |
| `public.api.availability.cache.miss`         | Counter | _(ninguna)_                       | Fallos de caché que requirieron consulta a base de datos.           |
| `domain.events.dispatch.duration`            | Timer   | `event_type`                      | Tiempo de ejecución al procesar y despachar eventos de dominio.     |
| `reports.csv.export.duration`                | Timer   | _(ninguna)_                       | Duración de generación y transmisión de streams de reportes CSV.    |

### 3.2 Arquitectura del Servicio de Métricas

- **Clase**: `dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager`
- Registra `AtomicInteger` para el seguimiento del pool de conexiones `SseEmitter`.
- Registra temporizadores `Timer` para medir la latencia percentil (p95, p99) de consultas analíticas y exportaciones pesadas sin afectar el tiempo de respuesta.
- Se integra con `MeterRegistry` y se expone de forma estándar a través de Spring Boot Actuator en `/actuator/prometheus`.

---

## 4. Endpoints REST WebMVC y Streaming SSE Reactivo

### 4.1 Endpoints REST Unificados del Dashboard (Tenant vs. Parking Scope)

Todos los endpoints analíticos resuelven el `tenantId` desde el contexto seguro de sesión (`AuthenticationContextGateway`) y aceptan un parámetro opcional `?parkingId={uuid}`:

- **Si `parkingId` está presente**: La consulta se filtra exclusivamente para esa instalación.
- **Si `parkingId` se omite**: La consulta agrega y consolida todas las instalaciones pertenecientes al tenant autenticado.

1. `GET /api/v1/dashboard/summary?parkingId={optionalUUID}`
   - Retorna resumen en tiempo real: ocupación actual, total de plazas, plazas libres/ocupadas, ingresos del día, comparación porcentual frente a ayer y tiempo medio de permanencia.
   - En ámbito global (`parkingId` omitido): suma capacidades e ingresos de todas las sedes del tenant y calcula la tasa de ocupación ponderada.

2. `GET /api/v1/dashboard/occupancy-hourly?parkingId={optionalUUID}&startDate={iso}&endDate={iso}`
   - Consulta `v_parking_occupancy_hourly` retornando la curva cronológica de ocupación y volumen de tráfico para gráficos de área y líneas.

3. `GET /api/v1/dashboard/parkings-comparison?startDate={iso}&endDate={iso}`
   - **Nuevo Endpoint de Ranking Comparativo**: Diseñado específicamente para tenants que gestionan múltiples sedes (> 1).
   - Retorna array comparativo ordenado por tasa de ocupación o ingresos:

     ```json
     [
       {
         "parkingId": "c8b3687c-3f95-4424-9b5d-9c3f4e1762aa",
         "parkingName": "Sede Central Mall",
         "totalSlots": 150,
         "occupiedSlots": 108,
         "occupancyRate": 72.0,
         "todayRevenue": 450000.0,
         "currency": "COP",
         "activeTickets": 108,
         "avgStayMinutes": 75.5
       },
       {
         "parkingId": "b1a2345c-8d12-4213-9a3b-7f1234567890",
         "parkingName": "Sede Aeropuerto Express",
         "totalSlots": 200,
         "occupiedSlots": 90,
         "occupancyRate": 45.0,
         "todayRevenue": 620000.0,
         "currency": "COP",
         "activeTickets": 90,
         "avgStayMinutes": 240.0
       }
     ]
     ```

4. `GET /api/v1/reports/operational?parkingId={optionalUUID}&startDate={iso}&endDate={iso}&page=0&size=20&search={query}`
   - Retorna página paginada de registros operativos (`v_parking_operational_report`). Si se omite `parkingId`, lista tickets de todas las sedes del tenant, incluyendo la columna `parkingName`.

5. `GET /api/v1/reports/operational/csv?parkingId={optionalUUID}&startDate={iso}&endDate={iso}`
   - Produce `text/csv` con `Content-Disposition: attachment; filename="operational-report-{scope}-{date}.csv"`.
   - Streaming directo continuo al `OutputStream` del `HttpServletResponse` con consumo constante de memoria O(1).

### 4.2 Stream SSE Reactivo (`GET /api/v1/dashboard/stream?parkingId={optionalUUID}`)

- **Controlador**: `DashboardStreamController`
- **Manejador de Conexiones**: `DashboardSseRegistry`
  - Soporta suscripción por sede específica (`tenantId:parkingId`) o suscripción global del tenant (`tenantId`).
  - Timeout de 30 minutos con reconexión automática.
  - Heartbeat periódico cada 15 segundos (`event: ping`).
- **Despacho Reactivo por Eventos de Dominio**:
  - Ante un evento `TicketCheckedInEvent` o `TicketCheckedOutEvent`:
    1. Notifica a los suscriptores conectados al canal de la sede afectada (`tenantId:parkingId`).
    2. Notifica a los suscriptores conectados al canal consolidado del tenant (`tenantId`) enviando el delta de ocupación global y el identificador de la sede que cambió.
  - Eventos transmitidos: `event: snapshot`, `event: occupancy-update`, `event: revenue-update`, `event: ping`.

---

## 5. API Pública de Disponibilidad con Rate Limiting por Token Bucket

### 5.1 Especificación del Endpoint

- **URL**: `GET /api/v1/public/parkings/{parkingId}/availability`
- **Autenticación**: Pública (permitida en `SecurityChain`).
- **Respuesta JSON (200 OK)**:

```json
{
  "parkingId": "c8b3687c-3f95-4424-9b5d-9c3f4e1762aa",
  "name": "Nivo Central Mall",
  "timestamp": "2026-09-24T21:40:00Z",
  "totalSlots": 150,
  "availableSlots": 42,
  "occupiedSlots": 108,
  "occupancyRate": 72.0,
  "slotDistribution": [
    { "type": "CAR", "total": 100, "available": 24, "occupied": 76 },
    { "type": "MOTORCYCLE", "total": 40, "available": 15, "occupied": 25 },
    { "type": "EV", "total": 10, "available": 3, "occupied": 7 }
  ]
}
```

### 5.2 Token Bucket Rate Limiting (60 req/min por IP)

- **Filtro WebMVC**: `PublicApiRateLimitFilter` aplicando Token Bucket (capacidad 60 tokens, recarga 1 token/segundo por IP).
- **Cabeceras HTTP**: `X-RateLimit-Limit: 60`, `X-RateLimit-Remaining: n`, `X-RateLimit-Reset: epoch`.
- **Exceso de Tasa**: Código `HTTP 429 Too Many Requests` con cabecera `Retry-After: <segundos>`.
- **Caché en Memoria**: Caffeine con TTL de 30 segundos y cabecera `Cache-Control: public, max-age=30`.

---

## 6. Scalar Pre-Request Auto-Authentication

1. **Extensión OpenAPI**: Inyección de metadatos `x-scalar-pre-request` en `SwaggerConfiguration`.
2. **Script Hook**: Intercepta llamadas interactivas en `/scalar`, autentica en segundo plano vía `POST /api/v1/auth/login` con credenciales de prueba, almacena el JWT en caché de sesión e inyecta `Authorization: Bearer <token>` automáticamente.

---

## 7. Arquitectura Frontend en Angular 21+ (`apps/web`)

### 7.1 `DashboardFacade` (Gestión Reactiva con Detección Automática de Ámbito)

- **Ubicación**: `apps/web/src/app/features/dashboard/facade/dashboard.facade.ts`
- **Gestión de Ámbito Inteligente**:

  ```typescript
  export type DashboardScope =
    | { mode: "GLOBAL" }
    | { mode: "SINGLE"; parkingId: string; parkingName: string };

  export class DashboardFacade {
    // Lista de sedes accesibles para el tenant
    readonly accessibleParkings = signal<ParkingLotReference[]>([]);

    // Ámbito activo seleccionado por el usuario o fijado automáticamente
    readonly activeScope = signal<DashboardScope>({ mode: "GLOBAL" });

    // Detección automática: true si el tenant tiene más de 1 parqueadero
    readonly isMultiParkingTenant = computed(
      () => this.accessibleParkings().length > 1,
    );

    // Estado analítico
    readonly summary = signal<DashboardSummary | null>(null);
    readonly occupancyHourly = signal<HourlyOccupancyPoint[]>([]);
    readonly parkingsComparison = signal<ParkingComparisonItem[]>([]);
    readonly reports = signal<OperationalReportItem[]>([]);
    readonly isStreaming = signal<boolean>(false);
    readonly isExportingCsv = signal<boolean>(false);
  }
  ```

- **Lógica de Conmutación de Modo en UI**:
  - **Si `accessibleParkings().length === 1`**: La UI se auto-configura en modo `SINGLE` directo para esa sede, omitiendo selectores globales innecesarios.
  - **Si `accessibleParkings().length > 1`**: En el encabezado / selector se agrega la opción destacada `"🏢 Todas las Sedes (Consolidado Global)"`. Al seleccionarla, se activa el modo `GLOBAL`.
- **Consumo SSE con `fetch` y `ReadableStream`**:
  - Construye la URL según el ámbito: `/api/v1/dashboard/stream` (global) o `/api/v1/dashboard/stream?parkingId=${id}` (individual).
  - Incluye cabecera `Authorization: Bearer ${token}` y reconexión automática exponencial.

### 7.2 Componentes de Visualización con Chart.js

1. **`OccupancyTrendChartComponent`**:
   - Curva de ocupación con gradiente vertical (`tension: 0.4`).
   - Muestra la tendencia de ocupación horaria de la sede seleccionada o el promedio ponderado consolidado del tenant.

2. **`SlotDistributionDonutChartComponent`**:
   - Dona que muestra la proporción de plazas libres, ocupadas y reservadas con recorte central (`cutout: '75%'`) y tipografía del sistema.

3. **`ParkingComparisonChartComponent` (Nuevo Componente para Modo Multi-Sede)**:
   - **Renderizado Condicional**: Se visualiza exclusivamente cuando `isMultiParkingTenant()` es `true` y el ámbito es `GLOBAL`.
   - **Tipo de Gráfico**: Gráfico de barras horizontales (`bar` con `indexAxis: 'y'`).
   - **Métricas Contrastadas**: Compara la tasa de ocupación (%) y la facturación del día de cada sede lado a lado, permitiendo identificar al instante sedes congestionadas vs. sedes con capacidad ociosa.

### 7.3 Reportes Operativos con TanStack Table

- En modo `GLOBAL`: La tabla incluye de forma nativa la columna `"Sede / Instalación"` para distinguir el origen de cada ticket.
- En modo `SINGLE`: La columna de sede se oculta dinámicamente para maximizar espacio útil.
- **Regla Estricta**: No se permiten escaleras `@if / @else if` en el template. El renderizado de celdas se encapsula en la definición de columnas con `flexRenderComponent`.

### 7.4 Exportación en Streaming CSV

- El botón de exportación envía `parkingId` solo si el usuario se encuentra en modo sede individual; si está en modo global, descarga el consolidado de todas las sedes del tenant con la columna identificadora de sede.

### 7.5 Mandato del Sistema de Diseño (`@nivo-sass/design-system`)

- Uso estricto de componentes `nv-card`, `nv-badge`, `nv-button`, `nv-input`, `nv-select`, `nv-typography`, `nv-loader`. Cero elementos HTML crudos.

---

## 8. Casos Borde y Manejo de Errores

1. **Tenant con 1 sola sede**: La experiencia es completamente directa y limpia, comportándose idénticamente a una vista dedicada sin ruido de selectores multi-sede.
2. **Tenant que añade su 2da sede dinámicamente**: La señal computada `isMultiParkingTenant()` pasa automáticamente a `true`, habilitando la pestaña consolidada y el gráfico comparativo sin requerir recarga ni reconfiguración.
3. **Reconexión SSE con cambio de sede**: Si el usuario conmuta entre "Sede Norte" y "Consolidado Global", el `AbortController` cancela el stream anterior y abre de inmediato la nueva conexión SSE con el parámetro correspondiente.
4. **Rate limit en API pública**: Bloqueo anticipado por IP en WebMVC Filter respondiendo HTTP 429 sin golpear la base de datos.

---

## 9. Estrategia de Pruebas (Strict TDD & QA)

- **Unitarias Backend**:
  - `DashboardControllerTest`: Pruebas de endpoints con `parkingId` presente (ámbito sede) y sin `parkingId` (ámbito global tenant).
  - `ParkingsComparisonUseCaseTest`: Verificación de ranking de ocupación e ingresos ordenados correctamente.
  - `DashboardSseRegistryTest`: Comprobación de entrega de eventos a suscriptores específicos de sede y suscriptores del consolidado tenant.
  - `BackendOperationsMetricsManagerTest`: Verificación de métricas operativas en `MeterRegistry` sin etiquetas de alta cardinalidad.
- **Unitarias Frontend**:
  - `dashboard.facade.spec.ts`: Auto-detección de 1 vs. múltiples sedes, cambio de `activeScope` y reconexión de stream SSE.
  - `parking-comparison-chart.spec.ts`: Renderizado del gráfico de barras horizontal comparativo.
  - `operational-reports-table.spec.ts`: Visibilidad dinámica de columna de sede según el ámbito.
