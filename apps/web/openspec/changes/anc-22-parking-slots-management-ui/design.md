## Context

El artefacto de Open Design `nivo-gestion-plazas-v3.html` define la UI de gestión de plazas con una jerarquía clara: parqueadero padre > plazas. El listado es la pantalla central; la creación y edición viven en páginas completas; el detalle vive en un drawer; y las operaciones de riesgo usan modales.

## Goals / Non-Goals

**Goals**

- Implementar gestión de plazas consistente con el diseño visual aprobado
- Mantener creación/edición como páginas completas, no modales
- Permitir consulta rápida de detalle sin abandonar el listado
- Soportar acciones masivas y estados vacíos bien definidos

**Non-Goals**

- No rediseñar la navegación global de la app
- No cambiar el backend ni inventar nuevas capacidades de dominio
- No introducir edición inline en la tabla
- No mover la gestión de plazas a una pantalla independiente del parqueadero padre

## Decisions

### 1. Create/Edit como páginas completas

**Decisión**: La creación por lote y la edición de una plaza se implementan como páginas completas.

**Rationale**: El formulario tiene validaciones, preview, reglas de bloqueo y mensajes de riesgo. Un modal sería demasiado estrecho y rompería el patrón visual del diseño.

### 2. Detalle como drawer lateral

**Decisión**: El detalle de una plaza se abre en drawer, con tabs General/Historial.

**Rationale**: Permite inspección rápida sin perder el contexto del listado, y coincide con el diseño de Open Design.

### 3. Modales solo para acciones puntuales

**Decisión**: Usar modales únicamente para cambiar estado y eliminar, incluyendo confirmaciones extra cuando existan tickets activos o historial.

**Rationale**: Son acciones de bajo alcance pero con riesgo; el modal obliga a confirmar sin mezclarlo con navegación principal.

### 4. Creación por lote con preview

**Decisión**: La creación genera un rango secuencial con prefijo, tipo, zona y estado inicial, mostrando preview antes de confirmar.

**Rationale**: El diseño prioriza eficiencia para crear muchas plazas homogéneas con validación visual del rango.

### 5. Reglas de bloqueo por estado

**Decisión**: Si una plaza está ocupada, el número no se renombra; si tiene ticket activo, el tipo queda bloqueado.

**Rationale**: El diseño muestra restricciones explícitas para evitar cambios inconsistentes con ocupación real.

## Risks / Trade-offs

- El rango de creación puede generar conflictos con plazas existentes; se necesita validación clara antes de submit.
- La barra de acciones masivas y el drawer requieren coordinación de estado local para no perder selección.
- El patrón page + drawer + modal suma complejidad visual; hay que respetar la jerarquía para no saturar la pantalla.
