## Why

Actualmente el sistema NeoParking puede enviar notificaciones a los usuarios (email, SMS, push), pero NO existe forma de consultar el historial de notificaciones enviadas. Los usuarios y administradores necesitan poder visualizar qué notificaciones se enviaron, a quién, cuándo, y su estado de entrega. Sin esta capacidad, es imposible auditar comunicaciones o diagnosticar problemas de entrega.

## What Changes

- **Nuevo endpoint REST** para consultar historial de notificaciones con filtros por usuario y tenant
- **Nueva entidad `NotificationHistory`** para persistir el registro de notificaciones enviadas
- **Nuevo módulo de dominio** `notification-history` encapsulando la lógica de consulta
- **Soporte de paginación** para manejar grandes volúmenes de historial
- **Filtros opcionales**: rango de fechas, tipo de notificación, estado de entrega

## Capabilities

### New Capabilities
- `notification-history`: Capacidad de consultar el historial de notificaciones enviadas, filtrado por usuario (recipient) y tenant. Incluye paginación y ordenamiento por fecha.

### Modified Capabilities
- (Ninguno - es una funcionalidad completamente nueva)

## Impact

- **Nuevo dominio**: `notification-history` (domain/notificationhistory/)
- **Nueva entidad JPA**: `NotificationHistory` en la capa de dominio
- **Nuevo repositorio**: `NotificationHistoryRepository` para consultas filtradas
- **Nuevo caso de uso**: `GetNotificationHistoryUseCase`
- **Nuevo endpoint REST**: `GET /api/v1/notifications/history` con query params
- **Tabla en BD**: `notification_history` para persistir registros
