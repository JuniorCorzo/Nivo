# Testing Rigor Standards

## Rigor en Pruebas Automatizadas (Anti-Trivial Assertions)

- **Prohibición de Aserciones Pobres:** NUNCA validar prueba con aserciones triviales (`assertThat(result).isNotNull()`, `expect(result).toBeDefined()`) o llamadas sin verificar datos.
- **Validación de Criterios de Aceptación Reales:**
  - **Aislamiento Multi-Tenant:** Fixtures con al menos 2 tenants distintos para verificar que datos de Tenant A no filtran a Tenant B.
  - **Precisión Matemática:** Solo estados completados (ej. `PAID`) suman a ingresos; descartar transacciones fallidas o pendientes.
  - **Casos Borde:** Probar comportamiento ante listas vacías, sedes sin movimientos, división por cero en porcentajes.
  - **Limpieza de Recursos:** Verificar ciclo de vida y destrucción de recursos (`chart.destroy()`, cierre de `SseEmitter` ante timeout/error).

## Control Térmico y Límites de Recursos en Desarrollo Local

- **Restricción de Recursos en Máquinas Portátiles:**
  - **Backend (Gradle):** En entornos locales de desarrollo con recursos limitados (<=4 núcleos, <=12GB RAM), las pruebas deben configurarse con `maxParallelForks = 1`, heap `-Xmx1g`, daemon `-Xmx2g` y `org.gradle.workers.max = 2` para evitar ahogamiento por swap y throttling térmico.
  - **Frontend (Playwright):** Pruebas E2E locales limitadas a `workers: 1` con flags ligeros de Chromium (`--disable-gpu`, `--disable-dev-shm-usage`, `--no-sandbox`). Preferir `Lightpanda` (`test:e2e:lightpanda`) para ejecuciones ultra-ligeras.
  - **Gestión de Ventilación:** En estaciones de trabajo con `nbfc`, fijar ventilador al 90%-100% (`nbfc set -s 95`) durante corridas intensivas y restaurar a automático (`nbfc set -a`) al finalizar.
