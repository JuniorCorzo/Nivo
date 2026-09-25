<!-- TAG: ADDED -->

# Delta Spec: Backend Dashboard REST APIs & Reactive SSE Streaming

## Motivación

El administrador de parqueadero requiere consultar resúmenes en tiempo real, visualizar tendencias históricas por horas, explorar reportes operacionales y recibir actualizaciones instantáneas de ocupación y recaudación sin necesidad de recargar la página o saturar el servidor mediante sondeo por intervalos continuos.

## Requerimientos

### 1. Endpoints REST de Analítica (`DashboardController` & `ReportsController`)

1. **`GET /api/v1/parkings/{parkingId}/dashboard/summary`**:
   - **Autenticación**: Requerida (Bearer JWT). Valida pertenencia de `parkingId` al tenant del usuario autenticado.
   - **Respuesta (200 OK)**:

     ```json
     {
       "parkingId": "c8b3687c-3f95-4424-9b5d-9c3f4e1762aa",
       "timestamp": "2026-09-24T21:40:00Z",
       "totalCapacity": 150,
       "occupiedSlots": 108,
       "availableSlots": 42,
       "reservedSlots": 0,
       "occupancyRate": 72.0,
       "activeTickets": 108,
       "todayRevenue": 145000.0,
       "currency": "COP",
       "avgStayMinutes": 84.5,
       "comparedToYesterdayRate": 5.4,
       "distributionByType": {
         "CAR": { "total": 100, "occupied": 76, "available": 24 },
         "MOTORCYCLE": { "total": 40, "occupied": 25, "available": 15 },
         "EV": { "total": 10, "occupied": 7, "available": 3 }
       }
     }
     ```

   - **Latencia Objetivo**: < 200ms.

2. **`GET /api/v1/parkings/{parkingId}/dashboard/occupancy-hourly`**:
   - **Parámetros**: `startDate` (ISO OffsetDateTime), `endDate` (ISO OffsetDateTime).
   - **Respuesta**: Lista de puntos temporales ordenados ascendentemente:

     ```json
     [
       {
         "hourBucket": "2026-09-24T08:00:00Z",
         "checkins": 14,
         "checkouts": 2,
         "estimatedOccupancyRate": 48.0,
         "totalCapacity": 150
       }
     ]
     ```

3. **`GET /api/v1/parkings/{parkingId}/reports/operational`**:
   - **Parámetros**: `startDate`, `endDate`, `page` (default 0), `size` (default 20), `search` (opcional, filtra por placa o ticket).
   - **Respuesta**: Estructura `PageResponse<OperationalReportItemDTO>` conteniendo tickets detallados, duraciones, tarifas, cobro y datos de usuario/operador.

4. **`GET /api/v1/parkings/{parkingId}/reports/operational/csv`**:
   - **Parámetros**: `startDate`, `endDate`.
   - **Headers de Respuesta**:
     - `Content-Type: text/csv; charset=UTF-8`
     - `Content-Disposition: attachment; filename="report-parking-{parkingId}-{date}.csv"`
   - **Streaming Directo**: Escribe por bloques en el `OutputStream` de la respuesta HTTP para evitar saturación de memoria heap ante grandes volúmenes de datos.

### 2. Stream SSE Reactivo (`/api/v1/parkings/{parkingId}/dashboard/stream`)

1. **Protocolo y Encabezados**:
   - Retorna `text/event-stream; charset=UTF-8`.
   - Cabecera `Cache-Control: no-cache`.
   - Cabecera `X-Accel-Buffering: no` (para compatibilidad con proxies NGINX).

2. **Manejo de Ciclo de Vida (`DashboardSseRegistry`)**:
   - Mantiene instancias `SseEmitter` con un tiempo de vida (timeout) de 30 minutos.
   - Envía cada 15 segundos un evento de mantenimiento de conexión:

     ```text
     event: ping
     data: {"timestamp": "2026-09-24T21:40:15Z"}
     ```

   - Desregistra limpiamente la conexión en invocaciones de `onCompletion`, `onTimeout` o `onError`.

3. **Eventos Transmitidos**:
   - **`event: snapshot`**: Se envía inmediatamente tras abrir la conexión SSE con el objeto completo de `DashboardSummary`.
   - **`event: occupancy-update`**: Se dispara cuando ocurre un evento de dominio `TicketCheckedInEvent` o `TicketCheckedOutEvent` en la sede:

     ```text
     event: occupancy-update
     data: {"parkingId":"...","occupiedSlots":109,"availableSlots":41,"occupancyRate":72.67,"timestamp":"..."}
     ```

   - **`event: revenue-update`**: Se dispara cuando se confirma un pago con éxito (`PaymentCompletedEvent`):

     ```text
     event: revenue-update
     data: {"parkingId":"...","todayRevenue":152000.00,"currency":"COP","timestamp":"..."}
     ```

4. **Seguridad y Aislamiento Multi-Tenant**:
   - El endpoint valida el token Bearer JWT de la petición.
   - Solamente se autoriza la suscripción a eventos de parqueaderos que pertenezcan al `tenant_id` validado en la sesión.
