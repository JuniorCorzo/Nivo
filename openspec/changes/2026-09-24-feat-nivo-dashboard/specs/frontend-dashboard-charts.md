<!-- TAG: ADDED -->

# Delta Spec: Frontend Dashboard Reactive Stream & Chart.js Visualizations

## Motivación

Los administradores necesitan comprender el comportamiento vehicular en tiempo real y a nivel histórico a través de curvas continuas de ocupación horaria, donas de distribución de capacidad y gráficos comparativos entre sedes cuando se gestionan múltiples instalaciones. La interfaz debe consumir el stream SSE reactivo con autenticación Bearer y renderizar gráficos fluidos y optimizados con Chart.js respetando la arquitectura de componentes `OnPush` y el sistema de diseño `@nivo-sass/design-system`.

## Requerimientos

### 1. `DashboardFacade` (Gestión Centralizada con Detección Automática de Ámbito)

- **Ubicación**: `apps/web/src/app/features/dashboard/facade/dashboard.facade.ts`
- **Responsabilidad**:
  - Detectar automáticamente si el tenant administra una sola instalación (`accessibleParkings().length === 1`) o múltiples sedes (`> 1`).
  - Gestionar señales reactivas de ámbito y datos:
    - `activeScope`: Señal `{ mode: 'GLOBAL' }` o `{ mode: 'SINGLE', parkingId: string, parkingName: string }`.
    - `isMultiParkingTenant`: Señal computada (`computed(() => this.accessibleParkings().length > 1)`).
    - `summary`: Señal de tipo `DashboardSummary | null`.
    - `occupancyHourly`: Señal de tipo `HourlyOccupancyPoint[]`.
    - `parkingsComparison`: Señal de tipo `ParkingComparisonItem[]` (cargada en modo `GLOBAL`).
    - `isStreaming`: Señal booleana de estado de conexión al flujo SSE.
    - `occupancyPercentage`: Señal computada (`computed()`) con el porcentaje general redondeado.
    - `isCapacityWarning`: Señal computada (`computed()`) que pasa a `true` si la ocupación es >= 90%.
  - **Consumo de SSE con Bearer Token**:
    - Conectar al stream SSE usando `fetch(url, { headers: { Authorization: 'Bearer ...' } })` con URL dinámica (`/api/v1/dashboard/stream` en modo global o `/api/v1/dashboard/stream?parkingId=${id}` en modo individual).
    - Parsear los eventos SSE y reaccionar a reconexiones automáticas con retroceso exponencial.

### 2. Componente de Curva de Ocupación (`OccupancyTrendChartComponent`)

- **Ubicación**: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/`
- **Estrategia de Detección**: `ChangeDetectionStrategy.OnPush`.
- **Inputs Reactivos**:
  - `data = input.required<HourlyOccupancyPoint[]>();`
  - `capacity = input<number>(100);`
- **Características Visuales en Chart.js**:
  - Tipo de gráfico: `line`.
  - Tensión de curva: `tension: 0.4` para curvas bezier suaves.
  - Gradiente vertical: Relleno suave con Canvas `createLinearGradient` desde el color principal semántico del tema con opacidad 0.35 hasta transparencia total en el eje inferior.
  - Línea punteada de umbral de capacidad (`borderDash: [6, 6]`).
  - Destrucción segura en `ngOnDestroy` (`this.chart?.destroy()`).

### 3. Componente de Dona de Distribución (`SlotDistributionDonutChartComponent`)

- **Ubicación**: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/`
- **Estrategia de Detección**: `ChangeDetectionStrategy.OnPush`.
- **Inputs Reactivos**:
  - `distribution = input.required<SlotDistributionItem[]>();`
  - `totalSlots = input<number>(0);`
- **Características Visuales en Chart.js**:
  - Tipo de gráfico: `doughnut`.
  - Recorte central (`cutout: '75%'`) que aloja en el centro un contenedor tipográfico con `nv-typography` indicando el porcentaje de ocupación global y el número de plazas libres.
  - Destrucción segura del objeto gráfico en `ngOnDestroy`.

### 4. Componente de Ranking Comparativo Multi-Sede (`ParkingComparisonChartComponent`)

- **Ubicación**: `apps/web/src/app/features/dashboard/components/parking-comparison-chart/`
- **Estrategia de Detección**: `ChangeDetectionStrategy.OnPush`.
- **Renderizado**: Solo se muestra cuando `isMultiParkingTenant()` es `true` y el ámbito activo es `GLOBAL`.
- **Inputs Reactivos**:
  - `data = input.required<ParkingComparisonItem[]>();`
- **Características Visuales en Chart.js**:
  - Tipo de gráfico: `bar` horizontal (`indexAxis: 'y'`).
  - Barras agrupadas o apiladas mostrando simultáneamente:
    - Barra 1: % de Ocupación actual de cada sede.
    - Barra 2: Facturación acumulada de la jornada normalizada.
  - Eje Y con los nombres de las sedes (`parkingName`).
  - Tooltips interactivos con detalle de plazas libres, tickets activos y moneda local.
  - Destrucción segura en `ngOnDestroy`.

### 5. Cumplimiento Mandatorio del Sistema de Diseño (`@nivo-sass/design-system`)

- Los contenedores de los gráficos se envuelven en componentes `nv-card`, con `nv-card-header`, `nv-card-title` y `nv-card-description`.
- Se emplean `nv-badge` para indicar el estado de conexión en vivo ("En Vivo" verde, "Reconectando" ámbar).
- Se prohíbe el uso de elementos `<button>` o `<input>` crudos; se utilizan exclusivamente `nv-button` y `nv-select` del sistema.
