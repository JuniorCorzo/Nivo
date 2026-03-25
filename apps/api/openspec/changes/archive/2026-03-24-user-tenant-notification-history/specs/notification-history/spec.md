## ADDED Requirements

### Requirement: Consultar historial de notificaciones por tenant
El sistema DEBE permitir consultar el historial de notificaciones enviadas filtrado por tenant. El endpoint DEBE requerir el parámetro tenantId y DEBE retornar únicamente las notificaciones pertenientes a dicho tenant.

#### Scenario: Consulta exitosa con tenant válido
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history con un tenantId válido
- **THEN** el sistema retorna un response con paginación conteniendo las notificaciones de ese tenant

#### Scenario: Consulta sin tenantId
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history sin proporcionar tenantId
- **THEN** el sistema retorna un error 400 Bad Request indicando que tenantId es requerido

### Requirement: Filtrar historial por usuario destinatario
El sistema DEBE permitir filtrar el historial de notificaciones por el ID del usuario destinatario (recipientUserId).

#### Scenario: Filtrar por userId existente
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history con un userId que tiene notificaciones
- **THEN** el sistema retorna únicamente las notificaciones enviadas a ese usuario

#### Scenario: Filtrar por userId sin notificaciones
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history con un userId que no tiene notificaciones
- **THEN** el sistema retorna una página vacía

### Requirement: Filtrar historial por tipo de notificación
El sistema DEBE permitir filtrar el historial por tipo de notificación (EMAIL, SMS, PUSH).

#### Scenario: Filtrar por tipo EMAIL
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history con notificationType=EMAIL
- **THEN** el sistema retorna únicamente las notificaciones de tipo EMAIL

### Requirement: Filtrar historial por estado de entrega
El sistema DEBE permitir filtrar el historial por estado de entrega (SENT, DELIVERED, FAILED, PENDING).

#### Scenario: Filtrar por estado FAILED
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history con deliveryStatus=FAILED
- **THEN** el sistema retorna únicamente las notificaciones que fallaron en el envío

### Requirement: Filtrar historial por rango de fechas
El sistema DEBE permitir filtrar el historial por rango de fechas usando startDate y endDate.

#### Scenario: Filtrar por rango de fechas válido
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history con startDate y endDate válidos
- **THEN** el sistema retorna únicamente las notificaciones enviadas dentro de ese rango

#### Scenario: startDate mayor que endDate
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history con startDate mayor que endDate
- **THEN** el sistema retorna un error 400 Bad Request

### Requirement: Paginación de resultados
El sistema DEBE soportar paginación de los resultados del historial. Por defecto DEBE retornar 20 elementos por página.

#### Scenario: Paginación por defecto
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history sin especificar página
- **THEN** el sistema retorna la primera página con máximo 20 elementos

#### Scenario: Solicitar página específica
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history con page=1&size=10
- **THEN** el sistema retorna la segunda página con máximo 10 elementos

#### Scenario: Página fuera de rango
- **WHEN** se solicita una página mayor al total de páginas disponibles
- **THEN** el sistema retorna una página vacía

### Requirement: Ordenamiento de resultados
El sistema DEBE permitir ordenar los resultados por fecha de envío (sentAt) en orden descendente por defecto.

#### Scenario: Ordenamiento por defecto
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history sin especificar orden
- **THEN** los resultados se ordenan por sentAt en orden descendente (más recientes primero)

#### Scenario: Especificar orden personalizado
- **WHEN** se realiza una solicitud GET a /api/v1/notifications/history con sort=sentAt,asc
- **THEN** los resultados se ordenan por sentAt en orden ascendente (más antiguos primero)

### Requirement: Registro automático de notificaciones enviadas
El sistema DEBE registrar automáticamente cada notificación enviada en el historial cuando se complete el envío.

#### Scenario: Registrar notificación exitosa
- **WHEN** una notificación se envía exitosamente
- **THEN** el sistema crea un registro en notification_history con deliveryStatus=SENT y sentAt con la fecha actual
