## ADDED Requirements

### Requirement: Parking domain model
El sistema SHALL definir un modelo de dominio `ParkingModel` que extienda `BaseModel` con los campos: `name` (string), `address` (string), `capacity` (number), `currentOccupancy` (number), `status` (ParkingStatus), `location` (Coordinates), `description` (string | null), `contactPhone` (string | null), `operatingHours` (OperatingHours | null).

#### Scenario: Modelo de dominio completo
- **WHEN** se instancia un `ParkingModel`
- **THEN** contiene todos los campos heredados de `BaseModel` (id, createdAt, updatedAt) más los campos específicos de parqueadero

### Requirement: Parking creation model
El sistema SHALL definir `ParkingCreateModel` con los campos obligatorios: `name`, `address`, `capacity`, `latitude`, `longitude`. Y los campos opcionales: `description`, `contactPhone`, `operatingHours`.

#### Scenario: Modelo de creación con campos obligatorios
- **WHEN** se crea un `ParkingCreateModel`
- **THEN** los campos name, address, capacity, latitude, longitude son requeridos y el resto opcionales

### Requirement: Parking update model
El sistema SHALL definir `ParkingUpdateModel` como tipo `Partial<ParkingCreateModel>` para permitir actualización parcial de campos.

#### Scenario: Actualización parcial
- **WHEN** se envía un `ParkingUpdateModel` con solo el campo `name`
- **THEN** solo el nombre del parqueadero se actualiza, los demás campos permanecen sin cambios

### Requirement: Parking status type
El sistema SHALL definir `ParkingStatus` como union type: `'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'`.

#### Scenario: Estados válidos de parqueadero
- **WHEN** se asigna un status a un parqueadero
- **THEN** el valor DEBE ser uno de: ACTIVE, INACTIVE, MAINTENANCE

### Requirement: Coordinates type
El sistema SHALL definir `Coordinates` como tipo `{ latitude: number; longitude: number }` donde latitude está entre -90 y 90, y longitude entre -180 y 180.

#### Scenario: Coordenadas válidas
- **WHEN** se definen coordenadas
- **THEN** latitude está en rango [-90, 90] y longitude en rango [-180, 180]

### Requirement: Operating hours type
El sistema SHALL definir `OperatingHours` como tipo `{ open: string; close: string }` donde los valores son strings en formato HH:mm.

#### Scenario: Horario de operación
- **WHEN** se define un horario de operación
- **THEN** contiene hora de apertura y cierre en formato HH:mm (ej: { open: '06:00', close: '22:00' })

### Requirement: Parking mapper
El sistema SHALL proveer un `ParkingMapper` inyectable que convierta DTOs generados por ng-openapi-gen a modelos de dominio y viceversa.

#### Scenario: DTO a modelo de dominio
- **WHEN** se recibe un `ParkingDto` del API
- **THEN** `ParkingMapper.toModel()` retorna un `ParkingModel` con fechas convertidas a objetos Date

#### Scenario: Modelo de creación a DTO
- **WHEN** se envía un `ParkingCreateModel` al API
- **THEN** `ParkingMapper.toCreateDto()` retorna el DTO correspondiente con los campos mapeados correctamente
