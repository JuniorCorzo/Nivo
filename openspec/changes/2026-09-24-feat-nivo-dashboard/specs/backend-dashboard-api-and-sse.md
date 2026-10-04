<!-- TAG: ADDED -->

# Delta Spec: Backend Dashboard REST APIs & Reactive SSE Streaming

## Motivación

El administrador de parqueadero requiere consultar resúmenes analíticos en tiempo real, visualizar tendencias históricas por horas, explorar reportes operacionales y recibir actualizaciones instantáneas de ocupación y recaudación sin necesidad de recargar la página o saturar el servidor mediante sondeo continuo (polling). Asimismo, para organizaciones que administran múltiples sedes, se requiere un modelo unificado de ámbito que permita alternar con un único parámetro (`?parkingId={optionalUUID}`) entre la vista de una sede puntual y la visión consolidada global con ranking comparativo entre sedes.

## Requerimientos

### 1. Endpoints REST de Analítica (`DashboardController` & `ReportsController`)

Todos los endpoints analíticos resuelven de forma obligatoria el `tenantId` desde el contexto seguro de sesión (`AuthenticationContextGateway`). El parámetro `parkingId` es opcional:

1. **`GET /api/v1/dashboard/summary?parkingId={optionalUUID}`**:
   - **Autenticación**: Requerida (Bearer JWT).
   - **Comportamiento**:
     - Con `parkingId`: Retorna métricas puntuales de dicha sede, validando pertenencia al tenant.
     - Sin `parkingId`: Retorna métricas consolidadas sumando capacidades, ingresos y tickets de todas las sedes del tenant, calculando el % de ocupación global ponderado.
   - **Respuesta (200 OK)**:

     ```json
     {
       "scope": "GLOBAL",
       "parkingId": null,
       "timestamp": "2026-09-24T21:40:00Z",
       "totalCapacity": 350,
       "occupiedSlots": 198,
       "availableSlots": 152,
       "reservedSlots": 0,
       "occupancyRate": 56.57,
       "activeTickets": 198,
       "todayRevenue": 1070000.0,
       "currency": "COP",
       "avgStayMinutes": 92.4,
       "comparedToYesterdayRate": 4.2,
       "distributionByType": {
         "CAR": { "total": 240, "occupied": 140, "available": 100 },
         "MOTORCYCLE": { "total": 80, "occupied": 45, "available": 35 },
         "EV": { "total": 30, "occupied": 13, "available": 17 }
       }
     }
     ```

2. **`GET /api/v1/dashboard/occupancy-hourly?parkingId={optionalUUID}&startDate={iso}&endDate={iso}`**:
   - Retorna la serie temporal horaria de ocupación. Si se omite `parkingId`, agrega checkins, checkouts y capacidad de todas las sedes por hora.

3. **`GET /api/v1/dashboard/parkings-comparison?startDate={iso}&endDate={iso}`**:
   - **Endpoint de Ranking Comparativo Multi-Sede**: Diseñado para tenants con más de una sede.
   - **Respuesta**: Array ordenado por ocupación o recaudación:

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

4. **`GET /api/v1/reports/operational?parkingId={optionalUUID}&startDate={iso}&endDate={iso}&page=0&size=20&search={query}`**:
   - Retorna página paginada de registros operativos (`v_parking_operational_report`). Si `parkingId` es nulo, incluye tickets de todas las sedes del tenant con la columna `parkingName`.

5. **`GET /api/v1/reports/operational/csv?parkingId={optionalUUID}&startDate={iso}&endDate={iso}`**:
   - Descarga en streaming continuo del archivo CSV con cabecera `Content-Disposition: attachment`.

### 2. Stream SSE Reactivo (`GET /api/v1/dashboard/stream?parkingId={optionalUUID}`)

1. **Protocolo y Encabezados**:
   - Retorna `text/event-stream; charset=UTF-8`.
   - Cabecera `Cache-Control: no-cache`.
   - Cabecera `X-Accel-Buffering: no`.

2. **Gestión de Suscripciones Dual (`DashboardSseRegistry`)**:
   - Si se incluye `parkingId`: El cliente se suscribe a los eventos puntuales de esa sede (`tenantId:parkingId`).
   - Si se omite `parkingId`: El cliente se suscribe al canal consolidado del tenant (`tenantId`), recibiendo notificaciones agregadas de cualquier sede de su organización.
   - Heartbeat periódico cada 15 segundos (`event: ping`).
   - Timeout de 30 minutos con reconexión automática.

3. **Eventos Transmitidos**:
   - **`event: snapshot`**: Snapshot inicial completo de `DashboardSummary`.
   - **`event: occupancy-update`**:

     ```text
     event: occupancy-update
     data: {"scope":"GLOBAL","parkingId":"c8b3687c-...","occupiedSlots":199,"availableSlots":151,"occupancyRate":56.86,"timestamp":"..."}
     ```

   - **`event: revenue-update`**:

     ```text
     event: revenue-update
     data: {"scope":"GLOBAL","parkingId":"c8b3687c-...","todayRevenue":1085000.00,"currency":"COP","timestamp":"..."}
     ```
