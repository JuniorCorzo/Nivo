## Context

El sistema Nivo actualmente tiene capacidad de enviar notificaciones email pero este persiste un historial consultable, la tabla se llama notifications logs

## Goals / Non-Goals

**Goals:**
- Implementar persistencia de historial de notificaciones enviadas
- Exponer endpoint REST para consultar historial filtrado por usuario y tenant
- Soportar paginación y filtros adicionales (fecha, tipo, estado)
- Mantener consistencia con la arquitectura hexagonal existente

**Non-Goals:**
- Modificar el sistema de envío de notificaciones existente (solo leer/registrar)
- Implementar reintentos o gestión de estados complejos de entrega
- Notificaciones en tiempo real (WebSocket)
- Exportación masiva o batch de historial

## Decisions

### Arquitectura Hexagonal
Se seguirá la arquitectura hexagonal existente en el proyecto:
- **Dominio**: `domain/notificationhistory/` - entidades y puertos
- **Aplicación**: `application/notificationhistory/` - casos de uso
- **Infraestructura**: `infrastructure/notificationhistory/` - adaptadores JPA

### Stack Tecnológico
- **Entity**: JPA con Hibernate para persistencia
- **Repository**: Spring Data JPA conSpecifications para filtros dinámicos
- **Endpoint**: Spring REST Controller con pagination support
- **Response**: DTOs con mapeo desde entidades

### Modelo de Datos
Mira la migracion V18 de flyway dentro de app-service/src/main/resources/db/migration

### Endpoint Design
```
GET /api/v1/notifications/history
Query Parameters:
  - tenantId (required)
  - userId (optional)
  - notificationType (optional)
  - deliveryStatus (optional)
  - startDate (optional)
  - endDate (optional)
  - page (default: 0)
  - size (default: 20)
  - sort (default: sentAt,desc)
```

## Risks / Trade-offs

- **[Riesgo] Volumen de datos**: El historial puede crecer mucho
  - **Mitigación**: Paginación obligatoria, índices en BD para columnas de filtro

- **[Riesgo] Performance con filtros complejos**
  - **Mitigación**: Usar Specifications de Spring Data para queries optimizadas, crear índices compuestos

- **[Riesgo] Acoplamiento con sistema de notificaciones existente**
  - **Mitigación**: El módulo será independiente, el sistema de notificaciones existente simplemente publicará eventos que este módulo consumirá (event-driven)
