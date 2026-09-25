<!-- TAG: ADDED -->
# Delta Spec: Database Views & Micrometer Metrics Instrumentation

## Motivación
El cómputo de métricas analíticas sobre millones de registros históricos en tiempo de consulta degrada el rendimiento de la base de datos PostgreSQL. Se requieren vistas precalculadas/optimizadas y telemetría de negocio instrumentada con Micrometer para monitorear el estado operativo y alimentar el dashboard y los sistemas de observabilidad (Prometheus/Grafana) con latencias mínimas.

## Requerimientos

### 1. Migración de Base de Datos (Flyway)
La migración `V5__create_dashboard_views_and_analytics.sql` debe crear las siguientes vistas y sus índices de soporte:

1. **Vista `nivo.v_parking_occupancy_hourly`**:
   - Agrupa transacciones de tickets por parqueadero (`parking_lot_id`), `tenant_id` y tramos horarios truncados (`date_trunc('hour', entry_time)`).
   - Calcula:
     - `checkins`: Conteo de ingresos en la hora.
     - `checkouts`: Conteo de egresos en la hora.
     - `total_capacity`: Plazas totales activas excluyendo las que están en mantenimiento.
     - `estimated_occupancy_rate`: Porcentaje de ocupación estimado (0.00% a 100.00%).

2. **Vista `nivo.v_parking_daily_summary`**:
   - Agrupa por `parking_lot_id`, `tenant_id` y fecha (`date_trunc('day', entry_time)::date`).
   - Calcula:
     - `total_tickets`: Total de tickets emitidos en la jornada.
     - `completed_tickets`: Tickets cerrados.
     - `ongoing_tickets`: Tickets abiertos actualmente.
     - `unique_vehicles`: Cantidad de placas vehiculares distintas registradas.
     - `total_revenue`: Suma de importes recaudados con estado `PAID`.
     - `avg_duration_minutes`: Promedio en minutos de permanencia de vehículos cerrados.
     - `currency`: Moneda de la sede.

3. **Vista `nivo.v_parking_operational_report`**:
   - Presenta registros detallados uniendo tickets, plazas, parqueaderos, tarifas y pagos.
   - Columnas requeridas: `ticket_id`, `tenant_id`, `parking_lot_id`, `parking_name`, `license_plate`, `slot_number`, `slot_zone`, `slot_prefix`, `slot_type`, `rate_name`, `entry_time`, `exit_time`, `duration_minutes`, `ticket_status`, `total_to_charge`, `payment_id`, `payment_status`, `payment_method`, `paid_amount`, `payment_date`, `operator_or_user_name`, `user_email`.

4. **Índices de Soporte**:
   - `idx_parking_tickets_entry_parking`: En `parking_tickets (slot_id, entry_time) WHERE deleted_at IS NULL`.
   - `idx_parking_tickets_exit`: En `parking_tickets (exit_time) WHERE exit_time IS NOT NULL AND deleted_at IS NULL`.
   - `idx_payments_ticket_status`: En `payments (parking_ticket_id, status) WHERE deleted_at IS NULL`.

### 2. Instrumentación de Métricas de Negocio con Micrometer
Se crea la clase de infraestructura `ParkingMetricsManager` gestionada por Spring e inyectada con `MeterRegistry`:

1. **Gauges de Ocupación por Sede (`parking.occupancy.*`)**:
   - `parking.occupancy.rate`: Registra el porcentaje actual de ocupación con tags `{parkingId, tenantId}`.
   - `parking.slots.total`: Total de plazas físicas operativas.
   - `parking.slots.occupied`: Plazas en estado `OCCUPIED` o `RESERVED`.
   - `parking.slots.available`: Plazas en estado `AVAILABLE`.
   - `parking.tickets.active`: Conteo de tickets en estado `OPEN`.

2. **Métricas de Facturación (`parking.revenue.*`)**:
   - `parking.revenue.daily`: Medidor acumulado de ingresos recaudados en el día en curso con tags `{parkingId, tenantId, currency}`.

3. **Contadores de Flujo Vehicular**:
   - `parking.checkin.total`: Incrementado ante cada check-in vehicular con tags `{parkingId, vehicleType}`.
   - `parking.checkout.total`: Incrementado ante cada check-out procesado con tags `{parkingId, vehicleType}`.

4. **Exposición en Prometheus**:
   - Todas las métricas del prefijo `parking.*` deben exponerse en `/actuator/prometheus` sin requerir credenciales de usuario final (habilitado para scrapers internos).
