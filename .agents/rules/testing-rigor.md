# Testing Rigor Standards

## Rigor en Pruebas Automatizadas (Anti-Trivial Assertions)

- **Prohibición de Aserciones Pobres:** NUNCA dar por válida una prueba con aserciones triviales como `assertThat(result).isNotNull()`, `expect(result).toBeDefined()` o meras llamadas sin verificación de datos.
- **Validación de Criterios de Aceptación Reales:**
  - **Aislamiento Multi-Tenant:** Fixtures con al menos 2 tenants distintos para comprobar que los datos del Tenant A no se filtran al Tenant B.
  - **Precisión Matemática:** Validar que solo estados completados (ej. `PAID`) sumen a ingresos, descartando transacciones fallidas o pendientes.
  - **Casos Borde:** Probar comportamiento ante listas vacías, sedes sin movimientos y prevención de división por cero en porcentajes.
  - **Limpieza de Recursos:** Comprobar el ciclo de vida y destrucción de recursos (invocación de `chart.destroy()`, cierre de `SseEmitter` ante timeout/error).
