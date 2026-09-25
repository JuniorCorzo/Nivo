<!-- TAG: ADDED -->

# Delta Spec: Frontend Dashboard Reactive Stream & Chart.js Visualizations

## Motivación

Los administradores necesitan comprender el comportamiento vehicular de su parqueadero en tiempo real y a nivel histórico a través de curvas continuas de ocupación por horas y donas de distribución de capacidad. La interfaz debe consumir el stream SSE reactivo con autenticación Bearer y renderizar gráficos fluidos y optimizados con Chart.js respetando la arquitectura de componentes `OnPush` y el sistema de diseño `@nivo-sass/design-system`.

## Requerimientos

### 1. `DashboardFacade` (Gestión Centralizada con Signals)

- **Ubicación**: `apps/web/src/app/features/dashboard/facade/dashboard.facade.ts`
- **Responsabilidad**:
  - Encapsular todo el estado reactivo del dashboard mediante Angular Signals:
    - `summary`: Señal de tipo `DashboardSummary | null`.
    - `occupancyHourly`: Señal de tipo `HourlyOccupancyPoint[]`.
    - `isStreaming`: Señal booleana indicando conexión activa al flujo SSE.
    - `connectionError`: Señal con errores de conexión o reconexión en curso.
    - `occupancyPercentage`: Señal computada (`computed()`) con el porcentaje general redondeado.
    - `isCapacityWarning`: Señal computada (`computed()`) que pasa a `true` si la ocupación es >= 90%.
  - **Consumo de SSE con Bearer Token**:
    - Implementar conexión mediante `fetch(url, { headers: { Authorization: 'Bearer ...' } })` y lectura secuencial del `ReadableStream` (`reader.read()`).
    - Parsear los bloques de eventos SSE (`event: snapshot`, `event: occupancy-update`, `event: revenue-update`, `event: ping`).
    - En caso de desconexión imprevista o fallo de red, reintentar automáticamente con retroceso exponencial (1s, 2s, 4s, hasta un tope de 30s) sin bloquear la interfaz de usuario.
    - Cerrar el lector y abortar la petición (`AbortController`) cuando se abandone la vista (`ngOnDestroy`).

### 2. Componente de Curva de Ocupación (`OccupancyTrendChartComponent`)

- **Ubicación**: `apps/web/src/app/features/dashboard/components/occupancy-trend-chart/`
- **Estrategia de Detección de Cambios**: `ChangeDetectionStrategy.OnPush`.
- **Inputs Reactivos**:
  - `data = input.required<HourlyOccupancyPoint[]>();`
  - `capacity = input<number>(100);`
- **Características Visuales en Chart.js**:
  - Tipo de gráfico: `line`.
  - Tensión de curva: `tension: 0.4` para curvas bezier suaves.
  - Gradiente vertical: Relleno suave con Canvas `createLinearGradient` desde el color principal semántico del tema (azul/verde primario) con opacidad 0.35 hasta transparencia total en el eje inferior.
  - Línea punteada de umbral de capacidad (`borderDash: [6, 6]`) en el 90% o 100% de la capacidad.
  - Tooltips interactivos formateados con hora local, cantidad de vehículos y porcentaje.
  - Destrucción segura en `ngOnDestroy` (`this.chart?.destroy()`) para prevenir fugas de memoria en el navegador.

### 3. Componente de Dona de Distribución (`SlotDistributionDonutChartComponent`)

- **Ubicación**: `apps/web/src/app/features/dashboard/components/slot-distribution-donut-chart/`
- **Estrategia de Detección de Cambios**: `ChangeDetectionStrategy.OnPush`.
- **Inputs Reactivos**:
  - `distribution = input.required<SlotDistributionItem[]>();`
  - `totalSlots = input<number>(0);`
- **Características Visuales en Chart.js**:
  - Tipo de gráfico: `doughnut`.
  - Recorte central (`cutout: '75%'`) que aloja en el centro un contenedor tipográfico con `nv-typography` indicando el porcentaje de ocupación global y el número de plazas libres.
  - Paleta de colores sincronizada con los tokens del sistema: Verde para `AVAILABLE`, Rojo/Naranja para `OCCUPIED`, Azul para `RESERVED`.
  - Animación suave de entrada (`animation.animateRotate: true`).
  - Destrucción segura del objeto gráfico en `ngOnDestroy`.

### 4. Cumplimiento Mandatorio del Sistema de Diseño (`@nivo-sass/design-system`)

- Los contenedores de los gráficos se envuelven en componentes `nv-card`, con `nv-card-header`, `nv-card-title` y `nv-card-description`.
- Se emplean `nv-badge` para indicar el estado de conexión en vivo ("En Vivo" verde, "Reconectando" ámbar).
- Se prohíbe el uso de elementos `<button>` crudos para alternar rangos temporales; se utilizan exclusivamente `nv-button` con variantes del sistema.
- Se muestran esqueletos de carga (`nv-loader` / placeholder) mientras las señales esperan la primera carga de datos.
