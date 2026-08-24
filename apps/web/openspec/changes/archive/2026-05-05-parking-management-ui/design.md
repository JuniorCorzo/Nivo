## Context

El proyecto Nivo Web es una aplicación Angular 21 zoneless con signal-based forms, arquitectura feature-based, y un sistema de diseño custom (`@nivo-sass/design-system`). Actualmente solo tiene autenticación (login/register) y un dashboard placeholder. La API se genera automáticamente desde un OpenAPI spec via `ng-openapi-gen`.

El backend ya expone (o expondrá) endpoints REST para gestión de parqueaderos. El frontend necesita consumir estos endpoints con la misma arquitectura que ya usa auth: Services → Mappers → Domain Models → Signal Forms → Components.

**Stack actual:**
- Angular 21 (zoneless, standalone components, signal forms experimentales)
- Tailwind CSS v4 + custom design system (`nv-*` components)
- `ng-openapi-gen` para generación de API services
- Patrón mapper (DTO ↔ Domain Model)
- Signal-based state (WritableSignal + computed)
- Subject + exhaustMap para formularios (anti double-submit)

## Goals / Non-Goals

**Goals:**
- Implementar flujo completo CRUD de parqueaderos siguiendo las convenciones existentes
- Componente de mapa interactivo para selección de ubicación
- Tabla paginada con filtros y búsqueda
- Formularios con validación en tiempo real usando signal forms
- Manejo de permisos en UI basado en roles existentes (OWNER, MANAGER, SUPERADMIN)
- Integración limpia con el sistema de auth e interceptores existentes

**Non-Goals:**
- No implementar backend API (asumimos endpoints existentes)
- No implementar sistema de permisos nuevo (usamos roles existentes)
- No implementar i18n real (se mantiene el patrón APP_TEXTS)
- No optimización de rendimiento de mapas (no clustering, no tiles custom)
- No manejo offline ni PWA
- No tests E2E en este cambio

## Decisions

### 1. Librería de mapas: Leaflet con wrapper ligero

**Decisión**: Usar Leaflet directamente con un service wrapper Angular, NO angular-leaflet ni ngx-leaflet.

**Rationale**: 
- Leaflet es la librería de mapas más liviana (~40KB gzipped)
- Los wrappers Angular existentes (ngx-leaflet) tienen poca mantención y no soportan Angular 21
- Un wrapper custom nos da control total y sigue el patrón del proyecto (injection, signals)
- Leaflet tiene excelente soporte para OpenStreetMap tiles (sin necesidad de API key)

**Alternativas consideradas**:
- `@asymmetrik/ngx-leaflet`: Última actualización hace 2+ años, dudoso soporte Angular 21
- Google Maps API: Requiere API key, más pesado, overkill para selección de ubicación simple
- Mapbox GL JS: Más features pero más complejo, requiere token

### 2. Arquitectura de rutas: Feature module con layout dashboard

**Decisión**: Crear un nuevo layout `LayoutDashboard` con sidebar que envuelva las rutas protegidas, y agregar `parking` como child route con `authGuard`.

**Rationale**: El layout actual `LayoutMinimal` es solo para auth (centrado, sin nav). Las páginas operativas necesitan sidebar y navegación. Este layout servirá para todas las features futuras, no solo parking.

```
/dashboard (LayoutDashboard + authGuard)
  ├── /overview  → DashboardPage (existente, movida)
  └── /parking
       ├── /         → ParkingListPage
       ├── /new       → ParkingCreatePage
       ├── /:id       → ParkingDetailPage
       └── /:id/edit  → ParkingEditPage
```

### 3. Patrón de estado: Signals locales por página

**Decisión**: Usar `WritableSignal` en cada componente página, NO crear un store global. El `ParkingService` expone métodos que retornan observables (desde HttpClient), cada página maneja su propio state.

**Rationale**: 
- Sigue el patrón existente (AuthService usa signals para auth state, pero los datos de cada feature page son locales)
- No hay necesidad de compartir estado de parqueaderos entre páginas remotas
- Mantiene la simplicidad y evita over-engineering

### 4. Reutilización del formulario: Componente formulario compartido

**Decisión**: Crear `ParkingFormComponent` como componente reusable que acepta un modelo via input signal y emite cambios via output. Se usa tanto en create como en edit.

**Rationale**: Evitar duplicación entre create y edit. El formulario es idéntico, solo cambia el modelo inicial y el endpoint de destino.

### 5. Paginación: Server-side

**Decisión**: Toda la paginación, filtrado y búsqueda se maneja server-side via query params.

**Rationale**: 
- Escalabilidad: un tenant puede tener cientos de parqueaderos
- El backend ya expone (o debería exponer) estos parámetros
- Sigue el patrón REST estándar

## Risks / Trade-offs

- **Leaflet CSS/assets**: Leaflet necesita su CSS y assets de markers. Riesgo de que no se rendericen los iconos de markers → Mitigación: importar CSS de Leaflet en `angular.json` y configurar `assets` para los marker icons
- **Signal Forms experimentales**: La API de signal forms puede tener bugs o cambios → Mitigación: seguir el patrón ya establecido en auth que funciona correctamente
- **ng-openapi-gen no ejecutado**: El directorio generated está vacío → Mitigación: asumir que los DTOs y services existirán cuando se genere, trabajar contra interfaces definidas en los specs
- **Permisos granulares**: El sistema actual solo tiene roles, no permisos por feature → Mitigación: ocultar/mostrar acciones basadas en rol usando el tipo `Role` existente, sin crear un sistema ABAC
