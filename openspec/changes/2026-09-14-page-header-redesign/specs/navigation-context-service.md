# Delta Spec: NavigationContextService

**Estado**: ADDED

## Requerimientos

### 1. Detección Reactiva de Contexto de Ruta
- **Dado** una navegación completada en el enrutador de Angular
- **Cuando** la ruta activa posee `data.navContext`
- **Entonces** `NavigationContextService` actualiza sus signals con la configuración del contexto.

### 2. Soporte de Scope `tenant` vs `parking`
- **Dado** una ruta con `scope: 'parking'`
- **Cuando** no es una ruta raíz
- **Entonces** los breadcrumbs incluyen el nombre del parqueadero activo resuelto dinámicamente mediante `ActiveParkingService.activeParkingName()`.
- **Dado** una ruta con `scope: 'tenant'` (ej. `/app/tickets`)
- **Entonces** las migas y la ruta móvil se resuelven sin depender forzosamente de una sede activa.
