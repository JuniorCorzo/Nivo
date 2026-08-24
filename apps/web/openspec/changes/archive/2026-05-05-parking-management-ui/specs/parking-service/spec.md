## ADDED Requirements

### Requirement: CRUD operations for parking
El sistema SHALL proveer un `ParkingService` inyectable con métodos para: `listAll(params)`, `getById(id)`, `create(model)`, `update(id, model)`, `delete(id)`.

#### Scenario: Obtener lista de parqueaderos
- **WHEN** se llama `listAll({ page: 1, size: 10, search: 'centro' })`
- **THEN** el servicio retorna un `ResponseModel<PaginatedResult<ParkingModel>>` con los resultados paginados

#### Scenario: Obtener un parqueadero por ID
- **WHEN** se llama `getById('parking-123')`
- **THEN** el servicio retorna un `ResponseModel<ParkingModel>` con los datos del parqueadero

#### Scenario: Crear un nuevo parqueadero
- **WHEN** se llama `create(parkingCreateModel)` con datos válidos
- **THEN** el servicio envía POST al endpoint de parqueaderos y retorna `ResponseModel<ParkingModel>`

#### Scenario: Actualizar un parqueadero existente
- **WHEN** se llama `update('parking-123', parkingUpdateModel)`
- **THEN** el servicio envía PUT al endpoint y retorna `ResponseModel<ParkingModel>`

#### Scenario: Eliminar un parqueadero
- **WHEN** se llama `delete('parking-123')`
- **THEN** el servicio envía DELETE y retorna `ResponseModel<void>`

### Requirement: HTTP context configuration
El servicio SHALL configurar el HttpContext con `AUTHORIZED: true` en todas las peticiones para que el interceptor de auth adjunte el token Bearer.

#### Scenario: Petición autenticada
- **WHEN** se realiza cualquier petición al API de parqueaderos
- **THEN** la petición incluye el header `Authorization: Bearer <token>` gracias al interceptor

### Requirement: DTO mapping integration
Todas las respuestas del API SHALL ser mapeadas a modelos de dominio usando `ParkingMapper` antes de retornar datos a los componentes.

#### Scenario: Respuesta mapeada
- **WHEN** el API retorna un DTO
- **THEN** el servicio lo convierte a modelo de dominio via mapper antes de retornarlo al componente

### Requirement: Paginated result type
El sistema SHALL definir `PaginatedResult<T>` con campos: `items: T[]`, `totalItems: number`, `currentPage: number`, `totalPages: number`, `pageSize: number`.

#### Scenario: Estructura de respuesta paginada
- **WHEN** se recibe una respuesta paginada del API
- **THEN** contiene la lista de items, total de items, página actual, total de páginas y tamaño de página
