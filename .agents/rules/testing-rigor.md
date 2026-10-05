# Testing Rigor Standards

## Rigor en Pruebas Automatizadas (Anti-Trivial Assertions)

- **Prohibición de Aserciones Pobres:** NUNCA validar prueba con aserciones triviales (`assertThat(result).isNotNull()`, `expect(result).toBeDefined()`) o llamadas sin verificar datos.
- **Validación de Criterios de Aceptación Reales:**
  - **Aislamiento Multi-Tenant:** Fixtures con al menos 2 tenants distintos para verificar que datos de Tenant A no filtran a Tenant B.
  - **Precisión Matemática:** Solo estados completados (ej. `PAID`) suman a ingresos; descartar transacciones fallidas o pendientes.
  - **Casos Borde:** Probar comportamiento ante listas vacías, sedes sin movimientos, división por cero en porcentajes.
  - **Limpieza de Recursos:** Verificar ciclo de vida y destrucción de recursos (`chart.destroy()`, cierre de `SseEmitter` ante timeout/error).
