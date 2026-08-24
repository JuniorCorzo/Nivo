## Why

El sistema actualmente solo cuenta con autenticación y un dashboard placeholder. Necesitamos la interfaz de gestión de parqueaderos como primera feature operativa del negocio. Los usuarios (OWNER/MANAGER) deben poder registrar, listar, ver detalle y editar parqueaderos, incluyendo la selección visual de ubicación mediante un mapa interactivo. Esta es la funcionalidad core que habilita todo el resto del producto.

## What Changes

- Nuevo módulo feature `parking` bajo `src/app/features/parking/` siguiendo la convención feature-based existente
- Página de listado de parqueaderos con tabla paginada, filtros y búsqueda
- Página de creación de parqueadero con formulario validado en tiempo real
- Página de edición de parqueadero reutilizando el formulario de creación
- Página de detalle de parqueadero con vista de solo lectura
- Componente de mapa interactivo para selección de ubicación (integración con Leaflet o similar)
- Modelo de dominio `ParkingModel` y mapper correspondiente
- Servicio `ParkingService` para comunicación con API
- Rutas protegidas con `authGuard` bajo nuevo layout de dashboard
- Integración con el sistema de permisos existente (Roles: OWNER, MANAGER, SUPERADMIN)
- Textos centralizados en `APP_TEXTS.parking`

## Capabilities

### New Capabilities
- `parking-models`: Modelos de dominio, tipos y mapper para la entidad parqueadero (ParkingModel, ParkingCreateModel, ParkingUpdateModel, coordenadas, etc.)
- `parking-service`: Servicio de comunicación con API REST para operaciones CRUD de parqueaderos, con manejo de errores y contexto HTTP
- `parking-list`: Página de listado de parqueaderos con tabla paginada, filtros por estado/nombre, búsqueda y acciones rápidas (editar, ver detalle)
- `parking-form`: Formulario de creación/edición de parqueadero con validaciones reactivas en tiempo real, usando signal forms
- `parking-detail`: Página de detalle de parqueadero con información completa y acciones (editar, eliminar)
- `parking-map`: Componente de mapa interactivo para selección y visualización de ubicación geográfica
- `parking-routes`: Configuración de rutas lazy-loaded para el módulo de parqueaderos, protegidas con authGuard

### Modified Capabilities
<!-- No hay specs existentes que modificar -->

## Impact

- **Rutas**: Se agrega segmento `parking` al routing principal con children para list, create, edit, detail
- **Layouts**: Posiblemente se necesite un nuevo layout con sidebar/navbar para las páginas protegidas
- **Servicios**: Nuevo ParkingService en core/services, nuevos modelos en core/models, nuevo mapper en core/mappers
- **API**: Se asume endpoints REST existentes para CRUD de parqueaderos (generados via ng-openapi-gen)
- **Dependencias**: Posible nueva dependencia para mapas (Leaflet/angular-leaflet)
- **APP_TEXTS**: Nuevo bloque `parking` en shared/constants
- **Permisos**: Extender uso de roles existentes (Role type) para restricciones de UI
