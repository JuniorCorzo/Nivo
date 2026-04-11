## ADDED Requirements

### Requirement: Parking creation form
El sistema SHALL proveer una página de creación de parqueadero en la ruta `/dashboard/parking/new` con formulario validado usando signal forms.

#### Scenario: Formulario de creación vacío
- **WHEN** el usuario navega a `/dashboard/parking/new`
- **THEN** se muestra un formulario vacío con los campos: nombre, dirección, capacidad, ubicación (mapa), descripción, teléfono de contacto, horario de operación

### Requirement: Parking edit form
El sistema SHALL proveer una página de edición en la ruta `/dashboard/parking/:id/edit` que pre-llena el formulario con los datos existentes.

#### Scenario: Formulario de edición pre-llenado
- **WHEN** el usuario navega a `/dashboard/parking/:id/edit`
- **THEN** el formulario se carga con los datos actuales del parqueadero

#### Scenario: Parqueadero no encontrado para editar
- **WHEN** el ID no corresponde a un parqueadero existente
- **THEN** se redirige a la lista con un mensaje de error

### Requirement: Form validations
El formulario SHALL validar en tiempo real todos los campos obligatorios y formatos.

#### Scenario: Campo nombre obligatorio
- **WHEN** el usuario envía el formulario sin nombre
- **THEN** se muestra error "El nombre es obligatorio" bajo el campo

#### Scenario: Capacidad numérica positiva
- **WHEN** el usuario ingresa una capacidad menor a 1
- **THEN** se muestra error "La capacidad debe ser mayor a 0"

#### Scenario: Dirección obligatoria
- **WHEN** el usuario envía el formulario sin dirección
- **THEN** se muestra error "La dirección es obligatoria"

#### Scenario: Ubicación obligatoria
- **WHEN** el usuario envía el formulario sin seleccionar ubicación en el mapa
- **THEN** se muestra error "Debe seleccionar una ubicación en el mapa"

### Requirement: Map integration in form
El formulario SHALL incluir un componente de mapa interactivo para seleccionar la ubicación del parqueadero.

#### Scenario: Selección de ubicación
- **WHEN** el usuario hace click en el mapa
- **THEN** se coloca un marker en la posición y se actualizan los campos de latitud/longitud

#### Scenario: Ubicación pre-existente en edición
- **WHEN** se carga un formulario de edición con coordenadas existentes
- **THEN** el mapa centra y muestra un marker en la ubicación guardada

### Requirement: Form submission
El formulario SHALL usar el patrón Subject + exhaustMap para prevenir envíos duplicados.

#### Scenario: Creación exitosa
- **WHEN** el usuario envía el formulario con datos válidos
- **THEN** se llama al `ParkingService.create()`, se muestra toast de éxito y se navega a la lista

#### Scenario: Error de servidor
- **WHEN** el API retorna un error de validación
- **THEN** se muestran los errores del servidor en los campos correspondientes del formulario

#### Scenario: Prevención de doble envío
- **WHEN** el usuario hace click en submit múltiples veces rápidamente
- **THEN** solo se envía una petición gracias al exhaustMap

### Requirement: Cancel navigation
El formulario SHALL tener un botón de cancelar que navega de vuelta a la lista.

#### Scenario: Cancelar creación
- **WHEN** el usuario hace click en "Cancelar"
- **THEN** se navega a `/dashboard/parking` sin guardar cambios

### Requirement: Shared form component
El formulario de creación y edición SHALL usar el mismo componente reutilizable `ParkingFormComponent` con inputs para el modo (create/edit) y modelo inicial.

#### Scenario: Modo creación
- **WHEN** el componente recibe `mode: 'create'`
- **THEN** muestra el formulario vacío y emite `parkingCreate` en submit

#### Scenario: Modo edición
- **WHEN** el componente recibe `mode: 'edit'` y `model: ParkingModel`
- **THEN** pre-llena el formulario y emite `parkingUpdate` en submit
