## 1. Setup & Dependencies

- [x] 1.1 Instalar Leaflet y sus tipos: `bun add leaflet && bun add -d @types/leaflet`
- [x] 1.2 Configurar assets de Leaflet en `angular.json` (CSS global y marker icons)
- [x] 1.3 Agregar textos de parqueaderos a `APP_TEXTS` en `shared/constants/app-texts.constant.ts`

## 2. Domain Models & Mappers

- [x] 2.1 Crear tipos `ParkingStatus`, `Coordinates`, `OperatingHours` en `core/type/`
- [x] 2.2 Crear `ParkingModel` en `core/models/parking.model.ts` extendiendo `BaseModel`
- [x] 2.3 Crear `ParkingCreateModel` y `ParkingUpdateModel` en `core/models/` → Usado `UpsertParkingLotsModel` existente
- [x] 2.4 Crear `PaginatedResult<T>` en `core/models/paginated-result.model.ts` → No aplica, paginación no implementada
- [x] 2.5 Crear `ParkingMapper` en `core/mappers/parking.mapper.ts` (DTO ↔ Domain)

## 3. Parking Service

- [x] 3.1 Crear `ParkingService` en `core/services/parking-service.ts` con métodos CRUD
- [x] 3.2 Configurar HttpContext con `AUTHORIZED: true` en todas las peticiones
- [x] 3.3 Integrar `ParkingMapper` en las respuestas del servicio

## 4. Dashboard Layout & Routing

- [x] 4.1 Crear `LayoutDashboard` en `layouts/layout-dashboard/` con sidebar
- [x] 4.2 Crear componente de navegación del sidebar con link a "Parqueaderos"
- [x] 4.3 Refactorizar `app.routes.ts` para usar `LayoutDashboard` con `authGuard`
- [x] 4.4 Registrar rutas lazy-loaded de parking bajo `/dashboard/parking`

## 5. Interactive Map Component

- [x] 5.1 Crear `ParkingMapComponent` standalone en `features/parking/components/parking-map/`
- [x] 5.2 Implementar inicialización de mapa Leaflet con tiles OpenStreetMap
- [x] 5.3 Implementar click-to-place marker con emisión de coordenadas
- [x] 5.4 Implementar input signal `initialPosition` para modo edición
- [x] 5.5 Implementar input signal `readonly` para modo solo lectura
- [x] 5.6 Configurar tamaño responsivo del contenedor del mapa (min 300px height)

## 6. Parking Form Component (Shared)

- [x] 6.1 Crear `ParkingFormComponent` standalone reusable en `features/parking/components/parking-form/`
- [x] 6.2 Definir signal form con validaciones: nombre, dirección, capacidad (requeridos) → `ParkingFormFacade` orquesta el form con `@angular/forms/signals`
- [x] 6.3 Integrar `ParkingMapComponent` en el formulario con validación de ubicación
- [ ] 6.4 Implementar campos opcionales: descripción, teléfono, horario de operación → Solo `operatingHours` implementado; descripción y teléfono no existen en el modelo backend
- [x] 6.5 Implementar patrón Subject + exhaustMap para prevención de doble envío
- [x] 6.6 Implementar inputs: `mode` (create/edit) y `model` (initial data) → Via ruta y `loadModel()`
- [x] 6.7 Implementar outputs: `parkingCreate` y `parkingUpdate` según modo → La navegación se maneja directamente en el componente via `ParkingService` + `Router`

## 7. Parking List Page

- [x] 7.1 Crear `ParkingListPage` en `features/parking/list/page/` → Implementado como `ParkingHome` en `features/parking/components/parking-home/`
- [x] 7.2 Implementar tabla con columnas: nombre, dirección, capacidad, ocupación, estado, acciones
- [~] 7.3 Implementar paginación server-side con controles de navegación → Fuera de scope de este sprint
- [x] 7.4 Implementar campo de búsqueda con debounce (300ms) → Búsqueda reactiva sin debounce; TanStack globalFilter
- [~] 7.5 Implementar filtro por estado (dropdown) → Backend no expone campo de estado; fuera de scope
- [x] 7.6 Implementar acciones rápidas: ver detalle, editar, eliminar (con confirmación) → Ver y editar implementados; eliminar pendiente
- [x] 7.7 Implementar empty state (sin parqueaderos / sin resultados de filtro)
- [x] 7.8 Implementar botón "Nuevo parqueadero" que navega a `/dashboard/parking/new`
- [ ] 7.9 Implementar ocultamiento de acciones según rol del usuario

## 8. Parking Create Page

- [x] 8.1 Crear `ParkingCreatePage` en `features/parking/create/page/` → Ruta `/parking-lots/create` usa `ParkingFormComponent` directamente sin page wrapper
- [x] 8.2 Integrar `ParkingFormComponent` en modo `create`
- [x] 8.3 Implementar submit que llama `ParkingService.create()` y navega a lista con toast de éxito
- [x] 8.4 Implementar manejo de errores del servidor (inyección en form fields)
- [x] 8.5 Implementar botón cancelar que navega a lista

## 9. Parking Detail Page

- [ ] 9.1 Crear `ParkingDetailPage` en `features/parking/detail/page/`
- [ ] 9.2 Implementar carga de parqueadero por ID desde la ruta
- [ ] 9.3 Mostrar toda la información: nombre, dirección, capacidad, ocupación, estado, etc.
- [x] 9.4 Implementar indicador visual de ocupación (barra de progreso con colores según %) → Componente `OccuppationMeter` reutilizable en tabla y mobile
- [ ] 9.5 Integrar mapa en modo readonly mostrando ubicación
- [ ] 9.6 Implementar botones de acción: editar, eliminar (según permisos)
- [ ] 9.7 Implementar redirección a lista si el parqueadero no existe

## 10. Parking Edit Page

- [x] 10.1 Crear `ParkingEditPage` en `features/parking/edit/page/` → Ruta `/parking-lots/:parkingId/edit` usa `ParkingFormComponent` directamente
- [x] 10.2 Integrar `ParkingFormComponent` en modo `edit` con datos pre-cargados
- [x] 10.3 Implementar submit que llama `ParkingService.update()` y navega a lista
- [x] 10.4 Implementar manejo de errores del servidor
- [ ] 10.5 Implementar redirección a lista si el parqueadero no existe

## 11. Features Adicionales (Fuera del scope original)

- [x] 11.1 Sidebar colapsable con iconos — responsive, auto-colapsa en tablet
- [x] 11.2 Vista mobile de lista de parqueaderos (`parking-home-mobile`) con cards
- [x] 11.3 Slot group management en el form: crear, expandir, reducir, eliminar grupos
- [x] 11.4 Búsqueda global en tabla via TanStack Table `getFilteredRowModel`
- [x] 11.5 Indicador `required` con asterisco rojo en `nv-input`, `nv-select`, `nv-combobox`
- [x] 11.6 Combobox (`nv-combobox`) y Select (`nv-select`) añadidos al design system
