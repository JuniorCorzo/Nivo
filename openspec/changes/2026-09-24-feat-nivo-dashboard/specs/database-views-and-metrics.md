<!-- TAG: ADDED -->

# Delta Spec: Database Views & Backend Operational Metrics Instrumentation

## Motivación

El cómputo de métricas analíticas sobre millones de registros históricos en tiempo de consulta degrada el rendimiento de la base de datos PostgreSQL. Para resolver esto de manera escalable y limpia, se establece una separación estricta entre la analítica de negocio multi-tenant y la observabilidad de la plataforma:

1. **Analítica de Negocio del Tenant**: Los datos operativos y financieros (% de plazas libres, ocupación en tiempo real, ingresos del día, tiempos de permanencia, rotación) residen exclusivamente en PostgreSQL mediante vistas optimizadas e indexadas con capacidad de consulta dual (por sede individual o consolidada a nivel de tenant), y son consumidos por los clientes del tenant a través de endpoints REST WebMVC y canales reactivos SSE.
2. **Telemetría Operativa en Prometheus**: Micrometer instrumenta métricas puramente operacionales del backend y de salud de la plataforma (rendimiento de consultas, volumen y latencia de endpoints públicos, conexiones SSE activas, despacho de eventos de dominio y exportaciones CSV). Se eliminan deliberadamente etiquetas de alta cardinalidad (`parkingId`, `tenantId`, `licensePlate`) para evitar la explosión de series temporales en Prometheus y preservar la privacidad multi-tenant.

## Requerimientos

### 1. Vistas Analíticas en PostgreSQL (Flyway)

La migración `V5__create_dashboard_views_and_analytics.sql` crea las siguientes vistas y sus índices de soporte:

1. **Vista `nivo.v_parking_occupancy_hourly`**:
   - Agrupa transacciones de tickets por parqueadero (`parking_lot_id`), `tenant_id` y tramos horarios truncados (`date_trunc('hour', entry_time)`).
   - Calcula:
     - `checkins`: Conteo de ingresos en la hora.
     - `checkouts`: Conteo de egresos en la hora.
     - `total_capacity`: Plazas totales activas excluyendo las que están en mantenimiento.
     - `estimated_occupancy_rate`: Porcentaje de ocupación estimado (0.00% a 100.00%).
   - **Soporte de Ámbitos**: Permite consultas directas filtradas por `parking_lot_id` para una sede individual, o consultas agregadas agrupando por `(tenant_id, hour_bucket)` para obtener la curva consolidada de todas las instalaciones del tenant.

2. **Vista `nivo.v_parking_daily_summary`**:
   - Agrupa por `parking_lot_id`, `tenant_id`, `parking_name` y fecha (`date_trunc('day', entry_time)::date`).
   - Calcula:
     - `total_tickets`: Total de tickets emitidos en la jornada.
     - `completed_tickets`: Tickets cerrados.
     - `ongoing_tickets`: Tickets abiertos actualmente.
     - `unique_vehicles`: Cantidad de placas vehiculares distintas registradas.
     - `total_revenue`: Suma de importes recaudados con estado `PAID`.
     - `avg_duration_minutes`: Promedio en minutos de permanencia de vehículos cerrados.
     - `currency`: Moneda de la sede.
   - **Base para Ranking Comparativo**: Permite consultar directamente la comparativa y ranking de sedes de un tenant en una fecha dada.

3. **Vista `nivo.v_parking_operational_report`**:
   - Presenta registros detallados uniendo tickets, plazas, parqueaderos, tarifas y pagos.
   - Columnas requeridas: `ticket_id`, `tenant_id`, `parking_lot_id`, `parking_name`, `license_plate`, `slot_number`, `slot_zone`, `slot_prefix`, `slot_type`, `rate_name`, `entry_time`, `exit_time`, `duration_minutes`, `ticket_status`, `total_to_charge`, `payment_id`, `payment_status`, `payment_method`, `paid_amount`, `payment_date`, `operator_or_user_name`, `user_email`.

4. **Índices de Soporte Compuestos Multi-Tenant**:
   - `idx_parking_tickets_tenant_entry`: En `parking_tickets (tenant_id, entry_time) WHERE deleted_at IS NULL`.
   - `idx_parking_tickets_tenant_exit`: En `parking_tickets (tenant_id, exit_time) WHERE exit_time IS NOT NULL AND deleted_at IS NULL`.
   - `idx_slots_tenant_parking_status`: En `slots (tenant_id, parking_lot_id, status) WHERE deleted_at IS NULL`.
   - `idx_payments_ticket_status`: En `payments (parking_ticket_id, status) WHERE deleted_at IS NULL`.

### 2. Instrumentación de Telemetría Operativa con Micrometer (`BackendOperationsMetricsManager`)

Se crea la clase de infraestructura `BackendOperationsMetricsManager` inyectada con `MeterRegistry`. Sus métricas se centran 100% en la salud del backend y el consumo de recursos, sin tags de negocio con alta cardinalidad:

1. **Métricas de Conectividad SSE (`sse.dashboard.*`)**:
   - `sse.dashboard.active.connections`: Gauge global que monitorea el número de clientes SSE actualmente conectados.
   - `sse.dashboard.events.broadcast.total`: Contador de eventos transmitidos exitosamente hacia clientes conectados.
   - `sse.dashboard.disconnects.total`: Contador de desconexiones (por timeout, cierre de cliente o error).

2. **Rendimiento de Consultas Analíticas (`db.analytics.*`)**:
   - `db.analytics.query.duration`: Timer que mide la latencia de ejecución de consultas sobre vistas analíticas, etiquetado con `view` (`hourly`, `daily`, `ops`, `comparison`).

3. **API Pública de Disponibilidad y Caché (`public.api.availability.*`)**:
   - `public.api.availability.requests.total`: Contador de solicitudes entrantes etiquetado con `status` (ej. `200`, `404`, `429`).
   - `public.api.availability.rate_limited.total`: Contador de peticiones bloqueadas por el limitador Token Bucket.
   - `public.api.availability.latency`: Timer que mide el tiempo de respuesta del endpoint público.
   - `public.api.availability.cache.hit`: Contador de aciertos en la caché en memoria de disponibilidad.
   - `public.api.availability.cache.miss`: Contador de fallos de caché que requirieron consulta a base de datos.

4. **Despacho de Eventos y Exportaciones (`domain.events.*`, `reports.csv.*`)**:
   - `domain.events.dispatch.duration`: Timer que mide el tiempo de procesamiento de listeners de eventos de dominio, etiquetado con `event_type` (`TicketCheckedInEvent`, `TicketCheckedOutEvent`, `PaymentCompletedEvent`).
   - `reports.csv.export.duration`: Timer que mide el tiempo total de generación y transmisión de streams CSV.

5. **Exposición en Prometheus**:
   - Todas estas métricas operativas se exponen vía `/actuator/prometheus` garantizando baja cardinalidad y alto valor para observabilidad de infraestructura (SRE).
