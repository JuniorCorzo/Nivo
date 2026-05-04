## ADDED Requirements

### Requirement: Parking detail page
El sistema SHALL mostrar una página de detalle de parqueadero en la ruta `/dashboard/parking/:id` con toda la información del parqueadero.

#### Scenario: Visualización de detalle
- **WHEN** el usuario navega a `/dashboard/parking/:id`
- **THEN** se muestra: nombre, dirección, capacidad, ocupación actual (con barra de progreso), estado, ubicación en mapa, descripción, teléfono de contacto, horario de operación, fechas de creación/actualización

#### Scenario: Parqueadero no encontrado
- **WHEN** el ID no corresponde a un parqueadero existente
- **THEN** se redirige a la lista con un mensaje de error via toast

### Requirement: Detail page actions
La página de detalle SHALL tener botones de acción según el rol del usuario.

#### Scenario: Acciones para OWNER/MANAGER/SUPERADMIN
- **WHEN** el usuario tiene permisos de edición
- **THEN** se muestran botones de "Editar" y "Eliminar"

#### Scenario: Navegar a edición
- **WHEN** el usuario hace click en "Editar"
- **THEN** navega a `/dashboard/parking/:id/edit`

#### Scenario: Eliminar desde detalle
- **WHEN** el usuario hace click en "Eliminar"
- **THEN** se muestra diálogo de confirmación y al confirmar se elimina y navega a la lista

### Requirement: Map display in detail
La página de detalle SHALL mostrar un mapa de solo lectura con la ubicación del parqueadero.

#### Scenario: Ubicación en mapa
- **WHEN** se carga la página de detalle
- **THEN** el mapa muestra un marker en la ubicación del parqueadero sin posibilidad de moverlo

### Requirement: Occupancy indicator
La página de detalle SHALL mostrar un indicador visual de ocupación (barra de progreso con porcentaje).

#### Scenario: Ocupación normal (< 80%)
- **WHEN** la ocupación actual es menor al 80% de la capacidad
- **THEN** la barra se muestra en color verde/primary

#### Scenario: Ocupación alta (>= 80%)
- **WHEN** la ocupación actual es >= 80% de la capacidad
- **THEN** la barra se muestra en color amarillo/naranja como indicador de advertencia

#### Scenario: Ocupación completa (100%)
- **WHEN** la ocupación actual es igual a la capacidad
- **THEN** la barra se muestra en color rojo indicando que está lleno
