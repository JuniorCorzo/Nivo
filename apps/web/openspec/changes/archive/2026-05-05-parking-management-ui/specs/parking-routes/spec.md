## ADDED Requirements

### Requirement: Dashboard layout route
El sistema SHALL tener un layout `LayoutDashboard` con sidebar que envuelva todas las rutas protegidas de la aplicación.

#### Scenario: Acceso a rutas protegidas
- **WHEN** el usuario navega a cualquier ruta bajo `/dashboard`
- **THEN** se renderiza el LayoutDashboard con sidebar y el componente de la ruta en el area de contenido

### Requirement: Parking feature routes
El sistema SHALL registrar las siguientes rutas lazy-loaded bajo `/dashboard/parking`: `/` (lista), `/new` (crear), `/:id` (detalle), `/:id/edit` (editar).

#### Scenario: Ruta de listado
- **WHEN** el usuario navega a `/dashboard/parking`
- **THEN** se carga y renderiza `ParkingListPage`

#### Scenario: Ruta de creación
- **WHEN** el usuario navega a `/dashboard/parking/new`
- **THEN** se carga y renderiza `ParkingCreatePage`

#### Scenario: Ruta de detalle
- **WHEN** el usuario navega a `/dashboard/parking/:id`
- **THEN** se carga y renderiza `ParkingDetailPage`

#### Scenario: Ruta de edición
- **WHEN** el usuario navega a `/dashboard/parking/:id/edit`
- **THEN** se carga y renderiza `ParkingEditPage`

### Requirement: Auth guard protection
Todas las rutas de parking SHALL estar protegidas por `authGuard` para que solo usuarios autenticados puedan acceder.

#### Scenario: Usuario no autenticado
- **WHEN** un usuario no autenticado intenta navegar a `/dashboard/parking`
- **THEN** se redirige a `/auth/login` con la URL guardada en `RedirectService`

#### Scenario: Usuario autenticado
- **WHEN** un usuario autenticado navega a `/dashboard/parking`
- **THEN** se muestra la página normalmente

### Requirement: Sidebar navigation
El layout dashboard SHALL tener un sidebar con links de navegación a las secciones de la app.

#### Scenario: Navegación a parqueaderos
- **WHEN** se renderiza el sidebar
- **THEN** incluye un link "Parqueaderos" que navega a `/dashboard/parking`

#### Scenario: Indicador de ruta activa
- **WHEN** el usuario está en `/dashboard/parking`
- **THEN** el link "Parqueaderos" en el sidebar aparece visualmente activo/resaltado
