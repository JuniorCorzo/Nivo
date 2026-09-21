# Delta Spec: Integración en Vistas

**Estado**: MODIFIED

## Requerimientos

### 1. `parking-form`
- El formulario de parqueadero aloja sus botones principales (`Cancelar` y `Guardar`) en el slot `[actions]` del nuevo `PageHeaderComponent`.

### 2. `parking-home`
- La cabecera muestra el nombre del parqueadero activo, badge de apertura/estado, subtítulo con dirección/plazas/moneda y botones de navegación rápida.

### 3. `operations`, `slots` y `tickets`
- Todas las vistas adoptan la estructura del nuevo `PageHeaderComponent` con migas de pan y acciones estandarizadas.
