## Why

El diseño nuevo de Open Design define una sección de gestión de plazas con patrón distinto al formulario inline actual: listado con filtros y acciones masivas, creación por lote en página completa, edición en página completa, y un drawer de detalle. Necesitamos formalizar ese flujo para que la implementación no derive en modales inconsistentes para formularios principales.

## What Changes

- Nueva experiencia de gestión de plazas bajo el contexto de un parqueadero
- Página de listado con tabla, búsqueda, filtros, paginación, empty states y barra de acciones masivas
- Página de creación por lote con preview del rango y validación de conflictos
- Página de edición de plaza con reglas de bloqueo por estado/ticket
- Drawer lateral para detalle con tabs General/Historial
- Modales para cambiar estado y eliminar, incluyendo confirmaciones de riesgo
- Nuevas rutas y navegación breadcrumb bajo el parqueadero padre

## Impact

- Se reemplaza el patrón inline para la gestión compleja de plazas por páginas dedicadas
- Se agregan estados vacíos y restricciones visuales según estado de la plaza
- La gestión de detalle queda desacoplada del listado mediante drawer
- Se necesita actualizar routing, textos y modelos relacionados con slots/plazas
