# Observability & Infrastructure Standards

## Multi-Tenant & Backend Observability Principles

### Separación de Audiencias en Telemetría

- **Métricas de Negocio de Tenants:** Datos transaccionales de clientes (ocupación en vivo, plazas disponibles, recaudación, permanencia) residen exclusivamente en PostgreSQL (vistas optimizadas), entregados vía REST y SSE a web.
- **Observabilidad de Plataforma (Prometheus / Micrometer):** Salud, rendimiento y resiliencia de infraestructura backend (conexiones activas SSE, latencias consultas SQL, tasas de error, bloqueos Rate Limiting).

### Prohibición de Alta Cardinalidad (High-Cardinality Invariant)

- NUNCA registrar etiquetas dinámicas de alta cardinalidad (`tenantId`, `parkingId`, `licensePlate`, `ticketId`, `userId`, marcas temporales) en Prometheus. Etiquetas requieren valores acotados y predecibles (ej. `status: 200|404|429`, `view: daily|hourly|ops`).

## Seguridad en Infraestructura y Observabilidad (Grafana / Prometheus)

### Autenticación Obligatoria en Producción para Grafana

- **Aislamiento de Seguridad:** En producción (`compose.yaml`), Grafana requiere acceso anónimo deshabilitado (`GF_AUTH_ANONYMOUS_ENABLED=false`), registro deshabilitado (`GF_USERS_ALLOW_SIGN_UP=false`) y contraseña administrativa obligatoria por variable de entorno (`GF_SECURITY_ADMIN_PASSWORD`).
- **Acceso Local:** Acceso anónimo restringido exclusivamente a entorno local de desarrollo (`compose.dev.yaml`).
