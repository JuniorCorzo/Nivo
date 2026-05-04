## ADDED Requirements

### Requirement: Parking list page
El sistema SHALL mostrar una página de listado de parqueaderos en la ruta `/dashboard/parking` con tabla, paginación, filtros y búsqueda.

#### Scenario: Visualización de la lista
- **WHEN** el usuario navega a `/dashboard/parking`
- **THEN** se muestra una tabla con columnas: nombre, dirección, capacidad, ocupación actual, estado, acciones

#### Scenario: Paginación de resultados
- **WHEN** hay más parqueaderos que el tamaño de página configurado
- **THEN** se muestran controles de paginación que permiten navegar entre páginas

### Requirement: Search and filters
El sistema SHALL proveer un campo de búsqueda por texto y filtros por estado que se apliquen server-side.

#### Scenario: Búsqueda por nombre
- **WHEN** el usuario escribe "centro" en el campo de búsqueda
- **THEN** la tabla muestra solo parqueaderos cuyo nombre contiene "centro" (debounced a 300ms)

#### Scenario: Filtro por estado
- **WHEN** el usuario selecciona el filtro de estado "ACTIVE"
- **THEN** la tabla muestra solo parqueaderos con estado ACTIVE

#### Scenario: Combinación de filtros
- **WHEN** el usuario escribe búsqueda Y selecciona un filtro de estado
- **THEN** ambos criterios se aplican simultáneamente

### Requirement: Quick actions
Cada fila de la tabla SHALL tener botones de acción rápida: ver detalle, editar, eliminar.

#### Scenario: Navegar a detalle
- **WHEN** el usuario hace click en "Ver detalle"
- **THEN** navega a `/dashboard/parking/:id`

#### Scenario: Navegar a edición
- **WHEN** el usuario hace click en "Editar"
- **THEN** navega a `/dashboard/parking/:id/edit`

#### Scenario: Confirmar eliminación
- **WHEN** el usuario hace click en "Eliminar"
- **THEN** se muestra un diálogo de confirmación antes de proceder

### Requirement: Empty state
El sistema SHALL mostrar un estado vacío apropiado cuando no hay parqueaderos registrados.

#### Scenario: Lista vacía sin búsqueda
- **WHEN** no hay parqueaderos registrados
- **THEN** se muestra un mensaje "No hay parqueaderos registrados" con botón para crear uno nuevo

#### Scenario: Lista vacía con filtros
- **WHEN** los filtros aplicados no retornan resultados
- **THEN** se muestra un mensaje "No se encontraron resultados" con opción de limpiar filtros

### Requirement: Create parking button
La página de listado SHALL tener un botón prominente para crear un nuevo parqueadero.

#### Scenario: Navegar a creación
- **WHEN** el usuario hace click en "Nuevo parqueadero"
- **THEN** navega a `/dashboard/parking/new`

### Requirement: Permission-based UI
Las acciones SHALL mostrarse/ocultarse basadas en el rol del usuario.

#### Scenario: Acciones para OWNER/MANAGER
- **WHEN** el usuario tiene rol OWNER o MANAGER o SUPERADMIN
- **THEN** se muestran los botones de crear, editar y eliminar

#### Scenario: Restricción para OPERATOR/DRIVER/AUDITOR
- **WHEN** el usuario tiene rol OPERATOR, DRIVER o AUDITOR
- **THEN** solo se muestra el botón de ver detalle
