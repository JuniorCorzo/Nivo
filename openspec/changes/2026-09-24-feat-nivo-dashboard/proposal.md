# Propuesta: Dashboard Analítico, Métricas en Tiempo Real y API Pública de Disponibilidad (feat-nivo-dashboard)

## Meta

Dotar a la plataforma Nivo de un centro de mando analítico integral y en tiempo real para administradores de parqueaderos, complementado con una API pública de alta concurrencia para integraciones con aplicaciones de navegación vehicular externa.

## Justificación y Alcance

Actualmente, los administradores de parqueaderos carecen de visibilidad inmediata sobre la ocupación vehicular y el rendimiento financiero de sus sedes, dependiendo de consultas ad-hoc o recargas manuales. Asimismo, no existe un canal público y seguro para que aplicaciones externas (como Waze o Google Maps) consuman la disponibilidad de plazas en tiempo real sin comprometer la estabilidad del sistema ni exponer información confidencial.

Para solucionar estas limitaciones, la propuesta abarca los siguientes ejes fundamentales:

1. **Inteligencia de Datos y Vistas Optimizadas en PostgreSQL**:
   Creación de vistas dedicadas (`v_parking_occupancy_hourly`, `v_parking_daily_summary`, `v_parking_operational_report`) con índices de soporte, permitiendo consultas agregadas y reportes históricos con latencias inferiores a 200ms.

2. **Telemetría y Métricas de Negocio con Micrometer**:
   Instrumentación de contadores y medidores (gauges) en `MeterRegistry` (`parking.occupancy.rate`, `parking.revenue.daily`, `parking.slots.*`, `parking.checkin.total`), expuestos para monitoreo y alertas en Prometheus/Grafana.

3. **Streaming Reactivo en Tiempo Real vía Server-Sent Events (SSE)**:
   Transmisión unidireccional de eventos mediante `SseEmitter` (`event: occupancy-update`, `event: revenue-update`, `event: ping`), desacoplada mediante listeners de eventos de dominio (`CheckinVehicle`, `CheckoutVehicle`, `PaymentCompleted`) para reflejar cambios instantáneamente sin sondeo continuo (polling).

4. **API Pública de Disponibilidad con Rate Limiting**:
   Exposición del endpoint `GET /api/v1/public/parkings/{parkingId}/availability`, protegido contra abusos mediante el algoritmo Token Bucket (límite de 60 req/min por IP) y respaldado por una caché en memoria de 30 segundos.

5. **Auto-Autenticación Pre-Request en Scalar**:
   Integración de un script hook en la documentación OpenAPI de Scalar (`/scalar`) que obtiene y renueva automáticamente el token Bearer JWT con credenciales de prueba, agilizando las pruebas interactivas de endpoints protegidos.

6. **Frontend Moderno en Angular 21+ con Chart.js y TanStack Table**:
   Construcción de `DashboardFacade` basado en Angular Signals y consumo de streams SSE mediante `fetch` + `ReadableStream` con autenticación Bearer; visualizaciones avanzadas con Chart.js (curvas horarias con gradientes verticales y donas de distribución); tablas operativas declarativas con `@tanstack/angular-table` sin condicionales en plantillas; exportación fluida en streaming CSV y cumplimiento estricto del sistema de diseño `@nivo-sass/design-system`.
