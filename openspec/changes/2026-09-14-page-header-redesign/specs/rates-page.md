# Delta Spec: Rates Page Migration

**Estado**: ADDED

## Requerimientos

### 1. Smart Component Contenedor
- **Dado** la navegación a `/app/parking-lots/:parkingId/rates`
- **Cuando** el usuario entra a la ruta
- **Entonces** `RatesPageComponent` gestiona el estado de los tabs (`Tarifas`, `Calculadora`, `Políticas`), la carga de tarifas y la integración de `PageHeaderComponent`.

### 2. Desacoplamiento de `RateListComponent`
- `RateListComponent` se mantiene como componente hijo dentro de `components/rates-list/` con la responsabilidad exclusiva de filtros, listado y tarjetas de tarifas.
