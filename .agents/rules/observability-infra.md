# Observability & Infrastructure Standards

## Multi-Tenant & Backend Observability Principles

### Separación de Audiencias en Telemetría

- **Métricas de Negocio de Tenants:** Datos transaccionales de clientes (ocupación en vivo, plazas disponibles, recaudación, permanencia) residen exclusivamente en PostgreSQL (vistas optimizadas), entregadas vía REST y Server-Sent Events (SSE) a la aplicación web.
- **Observabilidad de Plataforma (Prometheus / Micrometer):** Reservada estrictamente para la salud, rendimiento y resiliencia de la infraestructura del backend (conexiones activas SSE, latencias de consultas a vistas SQL, tasas de error y bloqueos de Rate Limiting).

### Prohibición de Alta Cardinalidad (High-Cardinality Invariant)

- NUNCA registrar etiquetas dinámicas de alta cardinalidad (`tenantId`, `parkingId`, `licensePlate`, `ticketId`, `userId`, marcas temporales) en métricas de Prometheus. Todas las etiquetas deben tener valores acotados y predecibles (ej. `status: 200|404|429`, `view: daily|hourly|ops`).

## Seguridad en Infraestructura y Observabilidad (Grafana / Prometheus)

### Autenticación Obligatoria en Producción para Grafana

- **Aislamiento de Seguridad:** En despliegues de producción (`compose.yaml`), Grafana debe tener acceso anónimo deshabilitado (`GF_AUTH_ANONYMOUS_ENABLED=false`), registro deshabilitado (`GF_USERS_ALLOW_SIGN_UP=false`) y contraseña administrativa configurada obligatoriamente vía variable de entorno (`GF_SECURITY_ADMIN_PASSWORD`).
- **Acceso Local:** El acceso anónimo de conveniencia queda restringido exclusivamente al entorno local de desarrollo (`compose.dev.yaml`).
