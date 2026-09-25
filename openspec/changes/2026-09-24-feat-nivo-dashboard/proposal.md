# Propuesta: Dashboard Analítico, Métricas en Tiempo Real y API Pública de Disponibilidad (feat-nivo-dashboard)

## Meta

Dotar a la plataforma Nivo de un centro de mando analítico integral y en tiempo real para administradores de parqueaderos —con soporte tanto para visión detallada por sede como para analítica consolidada y ranking comparativo a nivel de tenant (multi-parqueadero)—, complementado con una API pública de alta concurrencia para integraciones con aplicaciones de navegación vehicular externa.

## Justificación y Alcance

Actualmente, los administradores de parqueaderos carecen de visibilidad inmediata sobre la ocupación vehicular y el rendimiento financiero de sus operaciones. Esta carencia se agrava en organizaciones que gestionan múltiples sedes simultáneamente, al no disponer de una vista global consolidada ni de métricas comparativas de rendimiento, ocupación y facturación entre instalaciones. Asimismo, no existe un canal público y seguro para que aplicaciones externas (como Waze o Google Maps) consulten la disponibilidad de plazas en tiempo real sin comprometer la estabilidad del sistema ni exponer información confidencial.

Para resolver estas limitaciones, la propuesta establece una arquitectura flexible basada en ámbitos de consulta (`tenant` global vs. `parking` individual mediante el parámetro opcional `?parkingId={uuid}`) y una separación estricta entre la analítica de negocio (alojada en PostgreSQL y entregada mediante REST/SSE) y la observabilidad operativa de la plataforma (monitoreada con Micrometer en Prometheus), abarcando los siguientes ejes fundamentales:

1. **Inteligencia de Datos y Vistas Optimizadas en PostgreSQL**:
   Creación de vistas analíticas dedicadas (`v_parking_occupancy_hourly`, `v_parking_daily_summary`, `v_parking_operational_report`) con índices compuestos, preparadas para agregación automática por sede individual o consolidada a nivel de tenant, asegurando tiempos de respuesta inferiores a 200ms.

2. **Analítica Consolidada y Ranking Comparativo Multi-Sede**:
   Capacidad de conmutación inteligente en el dashboard: si un tenant gestiona una única sede, la interfaz se enfoca limpiamente en dicha instalación; si gestiona múltiples sedes (> 1), habilita la opción "🏢 Todas las Sedes (Consolidado Global)", cálculo de KPIs combinados, y un endpoint de ranking comparativo (`GET /api/v1/dashboard/parkings-comparison`) para contrastar ocupación, rotación e ingresos relativos entre sedes.

3. **Observabilidad Operativa del Backend con Micrometer y Prometheus**:
   Instrumentación de telemetría de salud y rendimiento de infraestructura en `MeterRegistry` (`sse.dashboard.active.connections`, `db.analytics.query.duration`, `public.api.availability.*`, `reports.csv.export.duration`, `domain.events.dispatch.duration`), excluyendo deliberadamente etiquetas de alta cardinalidad para evitar la sobrecarga de series temporales en Prometheus.

4. **Streaming Reactivo en Tiempo Real vía Server-Sent Events (SSE)**:
   Transmisión unidireccional de eventos de negocio hacia la interfaz web mediante `SseEmitter` (`event: occupancy-update`, `event: revenue-update`, `event: ping`), con soporte para suscripción a nivel de sede puntual o canal consolidado del tenant completo, desacoplada mediante listeners de eventos de dominio (`CheckinVehicle`, `CheckoutVehicle`, `PaymentCompleted`).

5. **API Pública de Disponibilidad con Rate Limiting**:
   Exposición del endpoint `GET /api/v1/public/parkings/{parkingId}/availability`, protegido contra abusos mediante el algoritmo Token Bucket (límite de 60 req/min por IP) y respaldado por una caché en memoria de 30 segundos.

6. **Auto-Autenticación Pre-Request en Scalar**:
   Integración de un script hook en la documentación OpenAPI de Scalar (`/scalar`) que obtiene y renueva automáticamente el token Bearer JWT con credenciales de prueba, agilizando las pruebas interactivas de endpoints protegidos.

7. **Frontend Moderno en Angular 21+ con Chart.js y TanStack Table**:
   Construcción de `DashboardFacade` basado en Angular Signals con soporte de doble ámbito (sede única vs. consolidado multi-sede); consumo de streams SSE mediante `fetch` + `ReadableStream` con autenticación Bearer; gráficos analíticos en Chart.js (curvas horarias con gradientes, donas de distribución y gráfico de barras comparativas entre sedes); tablas operativas declarativas con `@tanstack/angular-table` sin condicionales en plantillas; exportación continua por streaming CSV y cumplimiento estricto del sistema de diseño `@nivo-sass/design-system`.
