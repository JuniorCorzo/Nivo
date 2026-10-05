<!-- TAG: ADDED -->

# Delta Spec: Frontend Operational Reports Table & Streaming CSV Export

## Motivación

El administrador del parqueadero necesita auditar el detalle de cada transacción vehicular (ingresos, egresos, tiempos de permanencia, tarifas y liquidaciones) con capacidad de filtrado por rangos de fecha y exportación de grandes volúmenes a formato CSV. Para organizaciones con múltiples sedes, la tabla debe soportar tanto la vista específica de una sede como el consolidado global de todas las instalaciones del tenant, identificando con claridad la sede de origen.

## Requerimientos

### 1. Componente de Tabla Operacional (`OperationalReportsTableComponent`)

- **Ubicación**: `apps/web/src/app/features/dashboard/components/operational-reports-table/`
- **Estrategia de Detección**: `ChangeDetectionStrategy.OnPush`.
- **Integración con TanStack Table**:
  - Utiliza `createAngularTable` con tipado estricto `OperationalReportItem`.
  - Configura columnas dinámicas con `createColumnHelper<OperationalReportItem>()`:
    - `parkingName`: **Columna de Sede / Instalación** visible automáticamente cuando el ámbito activo es `GLOBAL` (`isMultiParkingTenant() && activeScope().mode === 'GLOBAL'`). En modo sede individual se oculta para maximizar espacio.
    - `ticketId`: Identificador recortado accesible.
    - `licensePlate`: Placa vehicular renderizada con badge o estilo monospace.
    - `slot`: Prefijo y número de plaza con indicador de tipo (`CAR`, `MOTORCYCLE`, `EV`).
    - `entryTime` / `exitTime`: Fechas formateadas en hora local.
    - `durationMinutes`: Duración calculada amigable (ej. "1h 45m" o "22m").
    - `ticketStatus`: Estado del ticket visualizado con `nv-badge` (Verde para `CLOSED`, Azul para `OPEN`, Rojo para `LOST`).
    - `paidAmount`: Monto cobrado formateado con la moneda del parqueadero.
    - `paymentStatus`: Estado del pago con `nv-badge` (`PAID`, `PENDING_PAYMENT`, `CANCELLED`).
    - `operatorOrUser`: Nombre del usuario o email asociado.

### 2. Principio Estricto de Renderizado TanStack (Anti-Ladder Rule)

- **Prohibición Expresa**: Queda terminantemente prohibido utilizar escaleras condicionales `@if / @else if (column.id === '...')` en el archivo HTML del template.
- **Obligatoriedad**:
  - Toda la lógica visual de celdas se define en la configuración de la columna (`cell: info => ...` o inyectando componentes presentacionales reutilizables mediante `flexRenderComponent`).
  - El template HTML de la tabla debe permanecer puramente declarativo:

    ```html
    <table>
      <thead>
        @for (headerGroup of table.getHeaderGroups(); track headerGroup.id) {
        <tr>
          @for (header of headerGroup.headers; track header.id) {
          <th>
            <ng-container
              *flexRender="header.column.columnDef.header; props: header.getContext()"
            />
          </th>
          }
        </tr>
        }
      </thead>
      <tbody>
        @for (row of table.getRowModel().rows; track row.id) {
        <tr>
          @for (cell of row.getVisibleCells(); track cell.id) {
          <td>
            <ng-container
              *flexRender="cell.column.columnDef.cell; props: cell.getContext()"
            />
          </td>
          }
        </tr>
        }
      </tbody>
    </table>
    ```

### 3. Filtros y Paginación

- **Filtro Temporal**: Selector de fecha de inicio y fecha de fin integrado mediante controles del sistema (`nv-input[type="date"]`).
- **Paginación Reactiva**:
  - Controles de página siguiente, anterior y selector de tamaño de página (10, 25, 50 registros) mediante `nv-button` y `nv-select`.
  - Conexión directa a las señales de paginación en `DashboardFacade`.

### 4. Exportación Continua por Streaming CSV

- **Botón de Exportación**: Componente `nv-button` con variante `outline` e icono de descarga (`lucideDownload`).
- **Comportamiento en `DashboardFacade`**:
  - Invoca el endpoint `/api/v1/reports/operational/csv` enviando las fechas activas y el `parkingId` opcional (si el usuario está en modo sede individual; si está en modo global, se omite para descargar el consolidado del tenant).
  - Recibe el stream binario como `Blob` con tipo MIME `text/csv`.
  - Dispara la descarga en el navegador mediante la creación de un enlace dinámico (`URL.createObjectURL(blob)`) y limpieza posterior (`URL.revokeObjectURL(url)`).
  - Gestiona estados de carga (`isExportingCsv = signal(true/false)`) deshabilitando el botón mientras se genera el reporte.
  - Presenta notificaciones toast mediante `@ngxpert/hot-toast`:
    - Toast informativo durante la descarga: _"Generando reporte CSV..."_.
    - Toast de éxito: _"Reporte descargado exitosamente"_.
    - Toast de error si la petición falla: _"Error al generar el reporte CSV"_.

### 5. Mandato del Sistema de Diseño

- Se emplean componentes del paquete `@nivo-sass/design-system` en todo el flujo de reportes:
  - `nv-card` para enmarcar la sección del reporte.
  - `nv-button` para paginación y exportación CSV.
  - `nv-badge` para estados de ticket y pago.
  - `nv-input` para selección de fechas y caja de búsqueda rápida por placa.
  - `nv-typography` para encabezados y conteos de registros.
  - No se permiten tags HTML nativos `<button>` ni `<input>` desacoplados del sistema de diseño.
