## 1. Setup & Dependencies

- [ ] 1.1 Instalar Leaflet y sus tipos: `bun add leaflet && bun add -d @types/leaflet`
- [ ] 1.2 Configurar assets de Leaflet en `angular.json` (CSS global y marker icons)
- [ ] 1.3 Agregar textos de parqueaderos a `APP_TEXTS` en `shared/constants/app-texts.constant.ts`

## 2. Domain Models & Mappers

- [ ] 2.1 Crear tipos `ParkingStatus`, `Coordinates`, `OperatingHours` en `core/type/`
- [ ] 2.2 Crear `ParkingModel` en `core/models/parking.model.ts` extendiendo `BaseModel`
- [ ] 2.3 Crear `ParkingCreateModel` y `ParkingUpdateModel` en `core/models/`
- [ ] 2.4 Crear `PaginatedResult<T>` en `core/models/paginated-result.model.ts`
- [ ] 2.5 Crear `ParkingMapper` en `core/mappers/parking.mapper.ts` (DTO ↔ Domain)

## 3. Parking Service

- [ ] 3.1 Crear `ParkingService` en `core/services/parking-service.ts` con métodos CRUD
- [ ] 3.2 Configurar HttpContext con `AUTHORIZED: true` en todas las peticiones
- [ ] 3.3 Integrar `ParkingMapper` en las respuestas del servicio

## 4. Dashboard Layout & Routing

- [ ] 4.1 Crear `LayoutDashboard` en `layouts/layout-dashboard/` con sidebar
- [ ] 4.2 Crear componente de navegación del sidebar con link a "Parqueaderos"
- [ ] 4.3 Refactorizar `app.routes.ts` para usar `LayoutDashboard` con `authGuard`
- [ ] 4.4 Registrar rutas lazy-loaded de parking bajo `/dashboard/parking`

## 5. Interactive Map Component

- [ ] 5.1 Crear `ParkingMapComponent` standalone en `features/parking/components/parking-map/`
- [ ] 5.2 Implementar inicialización de mapa Leaflet con tiles OpenStreetMap
- [ ] 5.3 Implementar click-to-place marker con emisión de coordenadas
- [ ] 5.4 Implementar input signal `initialPosition` para modo edición
- [ ] 5.5 Implementar input signal `readonly` para modo solo lectura
- [ ] 5.6 Configurar tamaño responsivo del contenedor del mapa (min 300px height)

## 6. Parking Form Component (Shared)

- [ ] 6.1 Crear `ParkingFormComponent` standalone reusable en `features/parking/components/parking-form/`
- [ ] 6.2 Definir signal form con validaciones: nombre, dirección, capacidad (requeridos)
- [ ] 6.3 Integrar `ParkingMapComponent` en el formulario con validación de ubicación
- [ ] 6.4 Implementar campos opcionales: descripción, teléfono, horario de operación
- [ ] 6.5 Implementar patrón Subject + exhaustMap para prevención de doble envío
- [ ] 6.6 Implementar inputs: `mode` (create/edit) y `model` (initial data)
- [ ] 6.7 Implementar outputs: `parkingCreate` y `parkingUpdate` según modo

## 7. Parking List Page

- [ ] 7.1 Crear `ParkingListPage` en `features/parking/list/page/`
- [ ] 7.2 Implementar tabla con columnas: nombre, dirección, capacidad, ocupación, estado, acciones
- [ ] 7.3 Implementar paginación server-side con controles de navegación
- [ ] 7.4 Implementar campo de búsqueda con debounce (300ms)
- [ ] 7.5 Implementar filtro por estado (dropdown)
- [ ] 7.6 Implementar acciones rápidas: ver detalle, editar, eliminar (con confirmación)
- [ ] 7.7 Implementar empty state (sin parqueaderos / sin resultados de filtro)
- [ ] 7.8 Implementar botón "Nuevo parqueadero" que navega a `/dashboard/parking/new`
- [ ] 7.9 Implementar ocultamiento de acciones según rol del usuario

## 8. Parking Create Page

- [ ] 8.1 Crear `ParkingCreatePage` en `features/parking/create/page/`
- [ ] 8.2 Integrar `ParkingFormComponent` en modo `create`
- [ ] 8.3 Implementar submit que llama `ParkingService.create()` y navega a lista con toast de éxito
- [ ] 8.4 Implementar manejo de errores del servidor (inyección en form fields)
- [ ] 8.5 Implementar botón cancelar que navega a lista

## 9. Parking Detail Page

- [ ] 9.1 Crear `ParkingDetailPage` en `features/parking/detail/page/`
- [ ] 9.2 Implementar carga de parqueadero por ID desde la ruta
- [ ] 9.3 Mostrar toda la información: nombre, dirección, capacidad, ocupación, estado, etc.
- [ ] 9.4 Implementar indicador visual de ocupación (barra de progreso con colores según %)
- [ ] 9.5 Integrar mapa en modo readonly mostrando ubicación
- [ ] 9.6 Implementar botones de acción: editar, eliminar (según permisos)
- [ ] 9.7 Implementar redirección a lista si el parqueadero no existe

## 10. Parking Edit Page

- [ ] 10.1 Crear `ParkingEditPage` en `features/parking/edit/page/`
- [ ] 10.2 Integrar `ParkingFormComponent` en modo `edit` con datos pre-cargados
- [ ] 10.3 Implementar submit que llama `ParkingService.update()` y navega a detalle con toast
- [ ] 10.4 Implementar manejo de errores del servidor
- [ ] 10.5 Implementar redirección a lista si el parqueadero no existe
