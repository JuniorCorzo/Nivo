# Documento Técnico de Diseño UI — Gestión de Parqueaderos (Nivo Web)

> Basado en: `design.md` + 7 specs de `specs/` + análisis del design system `@nivo-sass/design-system`

---

## 1. Resumen del Sistema

### Propósito

La interfaz de gestión de parqueaderos es la **primera feature operativa** del sistema Nivo Web. Permite a usuarios con roles `OWNER`, `MANAGER` y `SUPERADMIN` realizar el ciclo completo de vida de parqueaderos: registrar, listar, consultar detalle, editar y eliminar. Incluye la selección visual de ubicación geográfica mediante un mapa interactivo.

### Alcance

| Dentro del alcance | Fuera del alcance |
|---|---|
| CRUD completo de parqueaderos | Backend API (se asumen endpoints existentes) |
| Mapa interactivo para selección de ubicación (Leaflet + OpenStreetMap) | Sistema de permisos nuevo (roles existentes) |
| Tabla paginada con filtros y búsqueda server-side | i18n real (se mantiene patrón `APP_TEXTS`) |
| Formularios con validación en tiempo real (signal forms) | Optimización de mapas (clustering, tiles custom) |
| Indicador de ocupación con semáforo de colores | PWA / manejo offline |
| Acciones condicionadas por rol | Tests E2E |

### Stack UI

- **Angular 21** zoneless, standalone components, signal forms
- **Tailwind CSS v4** + design tokens via CSS variables (light/dark)
- **`@nivo-sass/design-system`** — componentes primitivos (`nv-*`)
- **Leaflet** — mapa interactivo (wrapper custom, sin wrappers Angular de terceros)
- **`@ngxpert/hot-toast`** — notificaciones toast

---

## 2. Arquitectura de Pantallas

### Mapa de rutas

```
/dashboard (LayoutDashboard + authGuard)
  ├── /overview              → DashboardPage (existente, movida)
  └── /parking
       ├── /                  → ParkingListPage     [lectura: todos]
       ├── /new               → ParkingCreatePage    [escritura: OWNER/MANAGER/SUPERADMIN]
       ├── /:id               → ParkingDetailPage    [lectura: todos]
       └── /:id/edit          → ParkingEditPage      [escritura: OWNER/MANAGER/SUPERADMIN]
```

### Descripción funcional por vista

| Vista | Ruta | Propósito | Permisos |
|---|---|---|---|
| **ParkingListPage** | `/dashboard/parking` | Listado tabular de parqueaderos con búsqueda, filtros por estado, paginación y acciones rápidas | Todos — acciones CRUD solo para OWNER/MANAGER/SUPERADMIN |
| **ParkingCreatePage** | `/dashboard/parking/new` | Formulario de creación de nuevo parqueadero con mapa interactivo para ubicación | OWNER, MANAGER, SUPERADMIN |
| **ParkingDetailPage** | `/dashboard/parking/:id` | Vista de solo lectura con toda la información del parqueadero, barra de ocupación, mapa readonly | Todos — editar/eliminar solo para OWNER/MANAGER/SUPERADMIN |
| **ParkingEditPage** | `/dashboard/parking/:id/edit` | Formulario pre-llenado para edición, reutiliza `ParkingFormComponent` | OWNER, MANAGER, SUPERADMIN |

---

## 3. Layout General — `LayoutDashboard`

### Estructura base

```
┌──────────────────────────────────────────────────┐
│ [Sidebar]  │           [Main Content Area]        │
│            │                                      │
│  Logo      │  <router-outlet />                   │
│  ─────     │                                      │
│  Overview  │  Contenido dinámico de cada página    │
│  Parquea-  │                                      │
│  deros  ◀  │                                      │
│            │                                      │
│  ─────     │                                      │
│  (futuras  │                                      │
│   seccio-  │                                      │
│   nes)     │                                      │
│            │                                      │
│  ─────     │                                      │
│  Logout    │                                      │
└──────────────────────────────────────────────────┘
```

### Distribución detallada

| Zona | Ancho | Comportamiento | Contenido |
|---|---|---|---|
| **Sidebar** | `w-64` (256px) fijo | Colapsable en mobile (drawer), visible en `md+` | Logo, links de navegación con indicador activo, logout |
| **Main Content** | `flex-1` (resto) | Scroll independiente, `min-h-screen` | Header de página + `<router-outlet />` |
| **Header** (inside Main) | Full width del main | Fijo o sticky-top, height auto | Título de la sección actual, breadcrumbs opcional |

### Implementación del sidebar

```
LayoutDashboard (componente standalone)
├── <aside> — Sidebar
│   ├── Logo Nivo (ng-icon "nivo-logo-horizontal")
│   ├── <nav>
│   │   ├── <a> Overview     → routerLink="/dashboard/overview"
│   │   └── <a> Parqueaderos → routerLink="/dashboard/parking" [routerLinkActive]
│   ├── <hr /> (separador)
│   └── <button> Cerrar sesión → AuthService.logout()
└── <main> — Content Area
    ├── <router-outlet />
```

### Indicador de ruta activa

El link activo en el sidebar se distingue visualmente con:
- `routerLinkActive="active"` + `class.bg-accent`
- Texto en `text-foreground` (vs `text-muted-foreground` para inactivos)
- Opcional: borde izquierdo `border-l-2 border-primary`

### Responsive — Mobile

En pantallas `< md`:
- Sidebar se convierte en **drawer/overlay** activado por hamburger button
- Main content ocupa `w-full`
- El hamburger button se ubica en un mini-header sticky superior

---

## 4. Componentes Visuales por Pantalla

### 4.1 ParkingListPage

#### Jerarquía de componentes

```
ParkingListPage
├── PageHeader
│   ├── <nv-h1> "Parqueaderos"
│   └── <nv-button variant="default"> "Nuevo parqueadero" → /dashboard/parking/new
│       [condicional: hidden si rol ∉ {OWNER, MANAGER, SUPERADMIN}]
│
├── FiltersBar (flex row, gap-3, responsive wrap)
│   ├── <nv-input> Búsqueda por texto (debounced 300ms)
│   │   → icon: lucideSearch, placeholder: "Buscar por nombre..."
│   ├── <select> Filtro por estado
│   │   → opciones: Todos, Activo, Inactivo, En mantenimiento
│   └── <nv-button variant="ghost" size="icon"> Limpiar filtros
│
├── TableSection
│   ├── <table> — Tabla de parqueaderos
│   │   ├── <thead>
│   │   │   └── <tr> Nombre | Dirección | Capacidad | Ocupación | Estado | Acciones
│   │   └── <tbody>
│   │       └── <tr> [por cada parqueadero]
│   │           ├── <td> name — link al detalle
│   │           ├── <td> address
│   │           ├── <td> capacity (badge numérico)
│   │           ├── <td> currentOccupancy / capacity (mini progress bar)
│   │           ├── <td> status → <nv-badge variant={status}>
│   │           │       ACTIVE → "success", INACTIVE → "secondary", MAINTENANCE → "warning"
│   │           └── <td> ActionsColumn
│   │               ├── <nv-button variant="ghost" size="icon"> Ver → /:id
│   │               ├── <nv-button variant="ghost" size="icon"> Editar → /:id/edit
│   │               │   [condicional: OWNER/MANAGER/SUPERADMIN]
│   │               └── <nv-button variant="ghost" size="icon"> Eliminar → diálogo
│   │                   [condicional: OWNER/MANAGER/SUPERADMIN]
│   │
│   └── PaginationBar (flex between)
│       ├── <nv-muted> "Mostrando X-Y de Z"
│       └── PaginationControls
│           ├── <nv-button variant="outline" size="sm"> Anterior
│           ├── Página indicators [1] [2] [3] ...
│           └── <nv-button variant="outline" size="sm"> Siguiente
│
└── EmptyState (condicional, reemplaza TableSection)
    ├── Sin parqueaderos: ícono + "No hay parqueaderos registrados" + <nv-button> "Crear parqueadero"
    └── Sin resultados: ícono + "No se encontraron resultados" + <nv-button variant="ghost"> "Limpiar filtros"
```

#### Distribución (layout)

```
┌─────────────────────────────────────────────────┐
│  <nv-h1> Parqueaderos      [Nuevo parqueadero]  │
├─────────────────────────────────────────────────┤
│  🔍 Buscar...    [Estado ▾ Todos]    [✕]        │
├─────────────────────────────────────────────────┤
│ Nombre     │ Dirección   │ Cap. │ Ocup │ Estado │ Acciones │
│────────────┼─────────────┼──────┼──────┼────────┼──────────│
│ P. Centro  │ Cra 15 #..  │  50  │ ████ │ 🟢 Act │ 👁 ✏ 🗑  │
│ P. Norte   │ Av. 19 #..  │ 120  │ ████ │ 🟡 Mant│ 👁 ✏ 🗑  │
│ P. Sur     │ Calle 5 #..  │  30  │ ████ │ 🔴 Inac│ 👁      │
├─────────────────────────────────────────────────┤
│ Mostrando 1-10 de 45    ◀ Anterior  [1][2].. Siguiente ▶ │
└─────────────────────────────────────────────────┘
```

#### Badge de estado

| ParkingStatus | nv-badge variant | Label visible |
|---|---|---|
| `ACTIVE` | `success` | Activo |
| `INACTIVE` | `secondary` | Inactivo |
| `MAINTENANCE` | `warning` | En mantenimiento |

---

### 4.2 ParkingFormComponent (compartido — Create & Edit)

> Este componente es **reutilizado** por `ParkingCreatePage` y `ParkingEditPage`.

#### Inputs / Outputs

```typescript
@Component({
  selector: 'app-parking-form',
  inputs: {
    mode: 'create' | 'edit',           // determina label del submit
    model: ParkingModel | undefined,   // pre-llena en modo edit
  },
  outputs: {
    parkingCreate: EventEmitter<ParkingCreateModel>,
    parkingUpdate: EventEmitter<{ id: string; model: ParkingUpdateModel }>,
    cancel: EventEmitter<void>,
  },
})
```

#### Jerarquía de componentes

```
ParkingFormComponent
├── PageHeader
│   ├── <nv-h1> "Crear parqueadero" (create) / "Editar parqueadero" (edit)
│   └── <nv-button variant="ghost"> ← Volver a la lista (cancel)
│
├── FormCard (<nv-card>)
│   ├── <nv-card-header>
│   │   └── <nv-card-title> "Datos del parqueadero"
│   │
│   └── <nv-card-content>
│       └── <form> (signal form, novalidate)
│           │
│           ├── Sección: Información General
│           │   ├── <nv-input> nombre        — label, required, [formField]
│           │   ├── <nv-input> dirección     — label, required, [formField]
│           │   └── <nv-input> capacidad     — type="number", required, min=1, [formField]
│           │
│           ├── Sección: Ubicación
│           │   ├── <nv-h3> "Ubicación"
│           │   ├── <ParkingMapComponent>
│           │   │   ├── [initialPosition] = model?.location (modo edit)
│           │   │   ├── (positionChange) → actualiza lat/lng en el form
│           │   │   └── readonly = false
│           │   ├── <nv-input> latitud   — type="number", readonly, mostrado
│           │   ├── <nv-input> longitud  — type="number", readonly, mostrado
│           │   └── Error de ubicación obligatoria si no se seleccionó
│           │
│           ├── Sección: Información Adicional (opcional)
│           │   ├── <nv-input> teléfono de contacto
│           │   ├── <nv-input> descripción      — type="textarea" / multiline
│           │   └── Horario de operación
│           │       ├── <nv-input> hora apertura  — type="time", format HH:mm
│           │       └── <nv-input> hora cierre    — type="time", format HH:mm
│           │
│           └── FormFooter (flex gap-3, justify-end)
│               ├── <nv-button variant="outline"> "Cancelar"
│               └── <nv-button variant="default" type="submit" [disabled]="!valid">
│                   "Crear parqueadero" / "Guardar cambios"
│                   @if (isLoading) { <ng-icon name="lucideLoader" animate-spin /> }
```

#### Distribución (layout)

```
┌──────────────────────────────────────────────────┐
│  <nv-h1> Crear parqueadero                       │
├──────────────────────────────────────────────────┤
│  ┌─ <nv-card> ─────────────────────────────────┐ │
│  │  Datos del parqueadero                       │ │
│  │                                              │ │
│  │  Nombre*         [________________]          │ │
│  │  Dirección*      [________________]          │ │
│  │  Capacidad*      [________________]          │ │
│  │                                              │ │
│  │  ── Ubicación ────────────────────────────── │ │
│  │  ┌──────────────────────────────────────────┐│ │
│  │  │                                          ││ │
│  │  │          MAPA LEAFLET (min 300px)        ││ │
│  │  │          Click para seleccionar          ││ │
│  │  │                                          ││ │
│  │  └──────────────────────────────────────────┘│ │
│  │  Lat: 4.7110     Lng: -74.0721              │ │
│  │                                              │ │
│  │  ── Información Adicional ────────────────── │ │
│  │  Teléfono        [________________]          │ │
│  │  Descripción     [________________]          │ │
│  │  Apertura        [__:__]  Cierre [__:__]    │ │
│  │                                              │ │
│  │                    [Cancelar] [Crear parque.]│ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

#### Notas de implementación del formulario

- **Signal Form**: se usa `form()` de `@angular/forms/signals` con `required()` en campos obligatorios
- **Validación de ubicación**: custom validator que verifica que `latitude` y `longitude` estén seteados
- **Anti double-submit**: `Subject + exhaustMap` — mismo patrón que LoginPage/RegisterPage
- **Error server-side**: se mapean errores del API a los campos del formulario via `isResponseError()`
- **Loading state**: `isLoading = signal(false)` — deshabilita botón submit y muestra spinner

---

### 4.3 ParkingDetailPage

#### Jerarquía de componentes

```
ParkingDetailPage
├── PageHeader
│   ├── BackButton <nv-button variant="ghost" size="icon"> ← Volver
│   ├── <nv-h1> nombre del parqueadero
│   └── ActionsBar (flex gap-2)
│       ├── <nv-button variant="outline"> "Editar" → /dashboard/parking/:id/edit
│       │   [condicional: OWNER/MANAGER/SUPERADMIN]
│       └── <nv-button variant="destructive"> "Eliminar" → diálogo confirmación
│           [condicional: OWNER/MANAGER/SUPERADMIN]
│
├── DetailContent (<nv-card>)
│   ├── StatusRow (flex between, items-center)
│   │   ├── <nv-badge> estado (variant por ParkingStatus)
│   │   └── <nv-muted> "Creado: {fecha} · Actualizado: {fecha}"
│   │
│   ├── InfoGrid (2 columnas en md+, 1 en mobile)
│   │   ├── InfoItem
│   │   │   ├── <nv-muted> "Dirección"
│   │   │   └── <nv-p> address
│   │   ├── InfoItem
│   │   │   ├── <nv-muted> "Capacidad total"
│   │   │   └── <nv-h3> capacity
│   │   ├── InfoItem
│   │   │   ├── <nv-muted> "Ocupación actual"
│   │   │   └── <nv-h3> currentOccupancy / capacity
│   │   ├── InfoItem
│   │   │   ├── <nv-muted> "Teléfono"
│   │   │   └── <nv-p> contactPhone ?? "No registrado"
│   │   ├── InfoItem
│   │   │   ├── <nv-muted> "Horario"
│   │   │   └── <nv-p> "HH:mm - HH:mm" ?? "No definido"
│   │   └── InfoItem
│   │       ├── <nv-muted> "Descripción"
│   │       └── <nv-p> description ?? "Sin descripción"
│   │
│   └── OccupancySection
│       ├── <nv-h3> "Ocupación"
│       ├── ProgressBar (div bg-secondary, rounded)
│       │   └── ProgressBarFill (div con width%, border-radius, color dinámico)
│       └── <nv-p> "{currentOccupancy} de {capacity} espacios ({percentage}%)"
│
└── MapSection (<nv-card>)
    ├── <nv-card-header>
    │   └── <nv-card-title> "Ubicación"
    └── <nv-card-content>
        └── <ParkingMapComponent>
            ├── [initialPosition] = parking.location
            └── readonly = true
```

#### Distribución (layout)

```
┌──────────────────────────────────────────────────┐
│  ←  Parqueadero Centro Comercial        [Editar] [Eliminar] │
├──────────────────────────────────────────────────┤
│  ┌─ <nv-card> ─────────────────────────────────┐ │
│  │  🟢 Activo           Creado: 10/04/2026    │ │
│  │                                              │ │
│  │  Dirección          Cra 15 #82-34           │ │
│  │  Capacidad total    50 espacios             │ │
│  │  Ocupación actual   35 / 50                 │ │
│  │  Teléfono           310-123-4567             │ │
│  │  Horario            06:00 - 22:00           │ │
│  │  Descripción        Parqueadero cubierto... │ │
│  │                                              │ │
│  │  ── Ocupación ───────────────────────────── │ │
│  │  ████████████████░░░░░░░░░░  70%            │ │
│  │  35 de 50 espacios (70%)                     │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  ┌─ <nv-card> ─────────────────────────────────┐ │
│  │  Ubicación                                   │ │
│  │  ┌──────────────────────────────────────────┐│ │
│  │  │                                          ││ │
│  │  │        MAPA LEAFLET (READONLY)           ││ │
│  │  │        📍 Marker fijo                    ││ │
│  │  │                                          ││ │
│  │  └──────────────────────────────────────────┘│ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

#### Barra de ocupación — semáforo de colores

| Condición | Color (CSS variable) | Clase Tailwind |
|---|---|---|
| Ocupación < 80% | `--semantic-success` (#16a34a) | `bg-success` |
| Ocupación ≥ 80% y < 100% | `--semantic-warning` (#ca8a04) | `bg-warning` |
| Ocupación = 100% | `--semantic-error` (#ef4444) | `bg-error` |

---

### 4.4 ParkingMapComponent (componente compartido)

> Standalone, reusable. Usado en 3 contextos: formulario (create/edit) y detalle.

#### API del componente

```typescript
@Component({
  selector: 'app-parking-map',
  inputs: {
    initialPosition: signal<Coordinates | undefined>(undefined),
    readonly: signal<boolean>(false),
  },
  outputs: {
    positionChange: output<{ latitude: number; longitude: number }>(),
  },
})
```

#### Modos de uso

| Contexto | `initialPosition` | `readonly` | Comportamiento |
|---|---|---|---|
| **Crear** | `undefined` | `false` | Centra en ubicación por defecto, click coloca/mueve marker, emite coordenadas |
| **Editar** | `{ lat, lng }` existentes | `false` | Centra en ubicación guardada, click permite mover marker, emite coordenadas nuevas |
| **Detalle** | `{ lat, lng }` existentes | `true` | Centra en ubicación guardada, ignora clicks, marker fijo |

#### Dimensiones

- Width: `w-full` (100% del contenedor padre)
- Height: `min-h-[300px]` (mínimo 300px, puede crecer)
- Bordes: `rounded-lg` con `border border-border`

---

### 4.5 Componentes auxiliares necesarios

> El design system actual (`@nivo-sass/design-system`) NO incluye estos componentes primitivos. Necesitan implementarse como parte de esta feature o como contribución al design system.

| Componente | Descripción | Donde se usa |
|---|---|---|
| **`<select>` nativo estilizado** | Dropdown de filtro por estado. Se usa `<select>` de HTML con clases Tailwind mientras no exista `nv-select` | FiltersBar (ParkingListPage) |
| **Tabla HTML estilizada** | `<table>` con clases Tailwind: `w-full`, bordes, hover states, striped. No existe `nv-table` | ParkingListPage |
| **Barra de progreso** | `<div>` con `bg-secondary` como track y `<div>` hijo con `bg-{color}` como fill + `transition-all` | ParkingDetailPage (ocupación) |
| **Diálogo de confirmación** | Modal nativo `<dialog>` o overlay custom con `nv-card` + `nv-button` | Eliminar parqueadero |
| **Skeleton/Spinner** | Loading skeleton o spinner para datos. Se usa `<ng-icon name="lucideLoader" class="animate-spin">` existente + placeholder divs | Todas las páginas |

---

## 5. Flujos de Navegación

### 5.1 Diagrama de navegación principal

```
                        ┌──────────────────┐
                        │   Login / Auth    │
                        │  (LayoutMinimal)  │
                        └────────┬─────────┘
                                 │ auth success
                                 ▼
                        ┌──────────────────┐
                        │   Dashboard      │
                        │  (LayoutDashboard)│
                        └────────┬─────────┘
                                 │
                        ┌────────▼─────────┐
                        │  ParkingListPage  │◄──────────────────┐
                        │ /dashboard/parking│                    │
                        └──┬────┬────┬────┘                     │
                           │    │    │                          │
          ┌────────────────┘    │    └──────────┐               │
          ▼                     ▼               ▼               │
 ┌────────────────┐  ┌────────────────┐  ┌───────────────┐     │
 │ParkingCreatePage│  │ParkingDetailPage│  │  (Eliminar)    │     │
 │/parking/new     │  │/parking/:id     │  │  Diálogo      │     │
 └───────┬─────────┘  └──┬─────────┬───┘  │  confirmación │     │
         │                │         │       └───────┬───────┘     │
         │ éxito          │         │               │ confirmar   │
         ▼                ▼         ▼               │             │
     [lista] ◄─────── [lista] ┌─────────────────┐  │             │
                            │ParkingEditPage   │  │             │
                            │/parking/:id/edit  │  │             │
                            └────────┬─────────┘  │             │
                                     │ éxito      │             │
                                     ▼            │             │
                               [detalle] ─────────┼─────────────┘
```

### 5.2 Flujo CRUD detallado

#### Crear parqueadero
1. `ParkingListPage` → click "Nuevo parqueadero"
2. Navega a `ParkingCreatePage` (`/dashboard/parking/new`)
3. Usuario completa formulario (incluye click en mapa)
4. Submit → `ParkingService.create()` → toast éxito → navega a `ParkingListPage`
5. **Cancelar** → navega directamente a `ParkingListPage` sin guardar

#### Ver detalle
1. `ParkingListPage` → click ícono "Ver" en fila o click en nombre
2. Navega a `ParkingDetailPage` (`/dashboard/parking/:id`)
3. Muestra toda la info + mapa readonly + barra ocupación
4. **Volver** → navega a `ParkingListPage`

#### Editar parqueadero
1. Desde `ParkingListPage` → click "Editar" en fila
2. O desde `ParkingDetailPage` → click botón "Editar"
3. Navega a `ParkingEditPage` (`/dashboard/parking/:id/edit`)
4. Carga datos existentes, pre-llena formulario, mapa centra en ubicación
5. Submit → `ParkingService.update()` → toast éxito → navega a `ParkingDetailPage`
6. **Cancelar** → navega a `ParkingDetailPage`

#### Eliminar parqueadero
1. Desde `ParkingListPage` → click ícono "Eliminar"
2. O desde `ParkingDetailPage` → click botón "Eliminar"
3. Se muestra **diálogo de confirmación** ("¿Estás seguro? Esta acción no se puede deshacer.")
4. **Confirmar** → `ParkingService.delete()` → toast éxito → navega a `ParkingListPage`
5. **Cancelar diálogo** → se cierra, vuelve a la página original

### 5.3 Navegación por permisos

| Rol | Ver lista | Ver detalle | Crear | Editar | Eliminar |
|---|---|---|---|---|---|
| SUPERADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| OWNER | ✅ | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ | ✅ | ✅ |
| OPERATOR | ✅ | ✅ | ❌ | ❌ | ❌ |
| DRIVER | ✅ | ✅ | ❌ | ❌ | ❌ |
| AUDITOR | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 6. Estados de UI

### 6.1 ParkingListPage

#### Cargando (loading)

```
┌──────────────────────────────────────────────────┐
│  Parqueaderos                    [Nuevo parque.] │
├──────────────────────────────────────────────────┤
│  🔍 Buscar...    [Estado ▾]                      │
├──────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐    │
│  │  ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓  ▓▓▓  ▓▓▓▓  ▓▓ │    │
│  │  ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓  ▓▓▓  ▓▓▓▓  ▓▓ │    │
│  │  ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓  ▓▓▓  ▓▓▓▓  ▓▓ │    │
│  │  ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓  ▓▓▓  ▓▓▓▓  ▓▓ │    │
│  │  ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓  ▓▓▓  ▓▓▓▓  ▓▓ │    │
│  └──────────────────────────────────────────┘    │
│  Filtros y paginación deshabilitados             │
└──────────────────────────────────────────────────┘
```

- Skeleton rows animados (placeholder divs con `animate-pulse bg-muted rounded`)
- Filtros y paginación **deshabilitados** (`pointer-events-none opacity-50`)
- Tabla: 5 filas skeleton, celdas con ancho proporcional

#### Vacío — sin parqueaderos

```
┌──────────────────────────────────────────────────┐
│  Parqueaderos                    [Nuevo parque.] │
├──────────────────────────────────────────────────┤
│                                                   │
│              🅿️  (icono grande)                   │
│                                                   │
│       No hay parqueaderos registrados             │
│       Comienza agregando tu primer parqueadero    │
│                                                   │
│            [+ Crear parqueadero]                  │
│                                                   │
└──────────────────────────────────────────────────┘
```

- Icono `lucideParkingCircle` o similar, tamaño `size="64"`, color `text-muted-foreground`
- Texto principal: `<nv-h3> "No hay parqueaderos registrados"`
- Texto secundario: `<nv-muted> "Comienza agregando tu primer parqueadero"`
- Botón: `<nv-button variant="default"> "Crear parqueadero"`

#### Vacío — sin resultados de filtro/búsqueda

```
┌──────────────────────────────────────────────────┐
│  Parqueaderos                    [Nuevo parque.] │
├──────────────────────────────────────────────────┤
│  🔍 "centro"           [Estado ▾ Activo]         │
├──────────────────────────────────────────────────┤
│                                                   │
│              🔍  (icono)                          │
│                                                   │
│       No se encontraron resultados                │
│       Intenta ajustar los filtros de búsqueda     │
│                                                   │
│            [✕ Limpiar filtros]                    │
│                                                   │
└──────────────────────────────────────────────────┘
```

- Ícono `lucideSearchX`, color `text-muted-foreground`
- Botón: `<nv-button variant="ghost"> "Limpiar filtros"`

#### Error general

```
┌──────────────────────────────────────────────────┐
│  Parqueaderos                    [Nuevo parque.] │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌─ <nv-alert variant="destructive"> ──────────┐ │
│  │  ⚠️ Error al cargar los parqueaderos         │ │
│  │  No se pudo conectar con el servidor.        │ │
│  │  [Reintentar]                                │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
└──────────────────────────────────────────────────┘
```

- `<nv-alert variant="destructive">` con botón "Reintentar"
- Tabla oculta, reemplazada por el alerta
- Toast adicional del error interceptor si aplica

#### Éxito — eliminación

- Se muestra `<nv-toast>` con `ToastService.showToast()`:
  ```
  ✅ Parqueadero "Nombre" eliminado correctamente
  ```
- La tabla se recarga automáticamente (nueva petición al API)

---

### 6.2 ParkingFormComponent (Create & Edit)

#### Cargando — edit (datos iniciales)

```
┌──────────────────────────────────────────────────┐
│  Editar parqueadero                               │
├──────────────────────────────────────────────────┤
│  ┌─ <nv-card> ─────────────────────────────────┐ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  (skeleton fields)        │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                           │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                           │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                           │ │
│  │                    [Cancelar] [▓▓▓▓▓▓▓]     │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

- Solo en modo **edit**: skeleton mientras carga datos del API
- En modo **create**: no hay estado loading inicial, se muestra vacío directamente
- Botón submit **deshabilitado** durante la carga

#### Validación — errores de campo

```
  Nombre*
  [________________]
  ┌──────────────────────────────────────────────┐
  │  ⚠ El nombre es obligatorio                   │
  └──────────────────────────────────────────────┘

  Capacidad*
  [0________________]
  ┌──────────────────────────────────────────────┐
  │  ⚠ La capacidad debe ser mayor a 0            │
  └──────────────────────────────────────────────┘
```

- Se usa `nv-input [error]` con `ValidationError[]` (patrón existente)
- Errores visibles solo cuando `touched() && invalid()`
- Rojo destructivo: `text-destructive text-sm`

#### Validación — ubicación no seleccionada

```
  ── Ubicación ──────────────────────────────
  ┌──────────────────────────────────────────┐
  │                                          │
  │          MAPA (sin marker)               │
  │          "Haz click para seleccionar"    │
  │                                          │
  └──────────────────────────────────────────┘
  ┌──────────────────────────────────────────────┐
  │  ⚠ Debe seleccionar una ubicación en el mapa │
  └──────────────────────────────────────────────┘
```

- El mapa muestra hint visual: texto centrado sobre el mapa "Haz click para seleccionar una ubicación"
- Error se muestra bajo el mapa como campo de formulario

#### Enviando (submit loading)

```
                    [▓▓▓▓▓▓▓▓▓ Creando parqueadero... 🔄]
```

- Botón submit: `disabled`, texto cambia a "Creando..." / "Guardando...", spinner `lucideLoader animate-spin`
- Todos los campos del formulario: `disabled` durante el envío
- El patrón `exhaustMap` previene envíos duplicados

#### Error de servidor

```
  ┌─ <nv-alert variant="destructive"> ──────────┐
  │  ⚠️ Error al crear el parqueadero            │
  │  Ya existe un parqueadero con ese nombre.     │
  └──────────────────────────────────────────────┘

  Nombre*
  [P. Centro Norte___]
  ┌──────────────────────────────────────────────┐
  │  ⚠ Ya existe un parqueadero con este nombre  │  ← error mapeado al campo
  └──────────────────────────────────────────────┘
```

- Si el error tiene campo específico → se inyecta bajo el campo correspondiente
- Si el error es general → se muestra `<nv-alert variant="destructive">` arriba del formulario
- Se usa `isResponseError()` para detectar respuestas de error del servidor

#### Éxito

- Toast: `✅ Parqueadero creado exitosamente` o `✅ Parqueadero actualizado`
- Navegación automática a lista (create) o detalle (edit)

---

### 6.3 ParkingDetailPage

#### Cargando

```
┌──────────────────────────────────────────────────┐
│  ←  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                  [▓▓▓] [▓▓] │
├──────────────────────────────────────────────────┤
│  ┌─ <nv-card> ─────────────────────────────────┐ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  └──────────────────────────────────────────────┘ │
│  ┌─ <nv-card> ─────────────────────────────────┐ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

- Skeleton completo: header, info grid, barra ocupación, mapa
- Mapa: placeholder gris con `animate-pulse` mientras carga

#### No encontrado (404)

```
┌──────────────────────────────────────────────────┐
│                                                   │
│              🔍  (icono grande)                   │
│                                                   │
│       Parqueadero no encontrado                   │
│       El parqueadero que buscas no existe         │
│       o fue eliminado.                            │
│                                                   │
│            [← Volver a la lista]                  │
│                                                   │
└──────────────────────────────────────────────────┘
```

- Redirección automática a `ParkingListPage` después de ~2 segundos
- Toast de error: `⚠️ Parqueadero no encontrado`

#### Diálogo de confirmación — eliminar

```
  ┌─── Overlay (bg-black/50) ──────────────────┐
  │                                              │
  │   ┌─ <nv-card> modal ─────────────────────┐ │
  │   │  <nv-card-header>                      │ │
  │   │    <nv-card-title> Eliminar parqueadero │ │
  │   │                                        │ │
  │   │  <nv-card-content>                     │ │
  │   │    ¿Estás seguro de que deseas eliminar │ │
  │   │    "Parqueadero Centro"?               │ │
  │   │    Esta acción no se puede deshacer.    │ │
  │   │                                        │ │
  │   │  <nv-card-footer justify-end>          │ │
  │   │    <nv-button variant="outline">       │ │
  │   │      Cancelar                          │ │
  │   │    <nv-button variant="destructive">   │ │
  │   │      Eliminar                          │ │
  │   └────────────────────────────────────────┘ │
  │                                              │
  └──────────────────────────────────────────────┘
```

- Overlay: `fixed inset-0 bg-black/50 z-50 flex-center`
- Modal card: `w-full max-w-md rounded-lg shadow-lg`
- Cerrar: click en "Cancelar", click en overlay, o tecla Escape

---

### 6.4 ParkingMapComponent — Estados

| Estado | Visual | Comportamiento |
|---|---|---|
| **Inicializando** | Contenedor gris con skeleton/pulse | Tiles cargando, `animate-pulse` en el fondo |
| **Sin marker** | Mapa centrado en ubicación por defecto, sin pin | Click coloca marker |
| **Con marker** | Pin visible en posición seleccionada | Click nuevo mueve marker |
| **Readonly** | Pin visible, sin interacción | Clicks ignorados |
| **Error tiles** | Mapa con fondo gris + mensaje "Error al cargar mapa" | Funciona el click si no es readonly |

---

## 7. Convenciones de Textos (`APP_TEXTS.parking`)

Estructura propuesta para `shared/constants/app-texts.constant.ts`:

```typescript
parking: {
  list: {
    title: 'Parqueaderos',
    newButton: 'Nuevo parqueadero',
    search: { placeholder: 'Buscar por nombre...' },
    filter: { status: 'Estado', all: 'Todos' },
    table: {
      name: 'Nombre', address: 'Dirección', capacity: 'Capacidad',
      occupancy: 'Ocupación', status: 'Estado', actions: 'Acciones',
    },
    pagination: { showing: 'Mostrando {from}-{to} de {total}', previous: 'Anterior', next: 'Siguiente' },
    empty: { noItems: 'No hay parqueaderos registrados', noItemsHint: 'Comienza agregando tu primer parqueadero',
             noResults: 'No se encontraron resultados', noResultsHint: 'Intenta ajustar los filtros de búsqueda',
             clearFilters: 'Limpiar filtros' },
    delete: { confirmTitle: 'Eliminar parqueadero', confirmMessage: '¿Estás seguro? Esta acción no se puede deshacer.',
              success: 'Parqueadero eliminado correctamente' },
  },
  form: {
    createTitle: 'Crear parqueadero', editTitle: 'Editar parqueadero',
    submit: { create: 'Crear parqueadero', edit: 'Guardar cambios', creating: 'Creando...', saving: 'Guardando...' },
    cancel: 'Cancelar',
    fields: {
      name: { label: 'Nombre', placeholder: 'Nombre del parqueadero', errors: { required: 'El nombre es obligatorio' } },
      address: { label: 'Dirección', placeholder: 'Dirección completa', errors: { required: 'La dirección es obligatoria' } },
      capacity: { label: 'Capacidad', placeholder: 'Ej: 50', errors: { required: 'La capacidad es obligatoria', min: 'La capacidad debe ser mayor a 0' } },
      location: { label: 'Ubicación', hint: 'Haz click en el mapa para seleccionar', errors: { required: 'Debe seleccionar una ubicación en el mapa' } },
      phone: { label: 'Teléfono de contacto', placeholder: 'Ej: 310-123-4567' },
      description: { label: 'Descripción', placeholder: 'Descripción opcional del parqueadero' },
      hours: { label: 'Horario de operación', open: 'Apertura', close: 'Cierre' },
    },
    success: { create: 'Parqueadero creado exitosamente', update: 'Parqueadero actualizado exitosamente' },
    notFound: 'Parqueadero no encontrado',
  },
  detail: {
    back: 'Volver a la lista', edit: 'Editar', delete: 'Eliminar',
    info: { address: 'Dirección', capacity: 'Capacidad total', occupancy: 'Ocupación actual',
            phone: 'Teléfono', hours: 'Horario', description: 'Descripción',
            notRegistered: 'No registrado', notDefined: 'No definido', noDescription: 'Sin descripción' },
    occupancyLabel: 'Ocupación',
    location: 'Ubicación',
  },
  status: { ACTIVE: 'Activo', INACTIVE: 'Inactivo', MAINTENANCE: 'En mantenimiento' },
},
```

---

## 8. Resumen de Componentes por Archivo

| Archivo/Componente | Tipo | Reutilizable | Design System |
|---|---|---|---|
| `LayoutDashboard` | Layout | ✅ (toda la app) | — |
| `SidebarComponent` | Componente | ✅ (dentro de LayoutDashboard) | nv-button, nv-muted |
| `ParkingListPage` | Page | ❌ | nv-button, nv-badge, nv-input, nv-muted |
| `ParkingCreatePage` | Page | ❌ | nv-card, nv-button |
| `ParkingEditPage` | Page | ❌ | nv-card, nv-button |
| `ParkingDetailPage` | Page | ❌ | nv-card, nv-badge, nv-button, nv-alert |
| `ParkingFormComponent` | Componente | ✅ (create + edit) | nv-card, nv-input, nv-h3, nv-button |
| `ParkingMapComponent` | Componente | ✅ (3 contextos) | — (Leaflet) |
| `ConfirmDialogComponent` | Componente | ✅ (reutilizable) | nv-card, nv-button |

---

## 9. Decisiones de Diseño UI

| # | Decisión | Rationale |
|---|---|---|
| 1 | **Card-based layout** para formularios y detalle | Consistencia con el patrón existente (LoginPage usa nv-card). Delimitación visual clara de secciones |
| 2 | **Tabla HTML nativa** estilizada con Tailwind | No existe `nv-table` en el design system. Evita dependencias extras. Se puede extraer a `nv-table` en el futuro |
| 3 | **Diálogo de confirmación** custom (no native `<dialog>`) | Mayor control visual, consistencia con el design system, animaciones de entrada/salida |
| 4 | **Barra de progreso** CSS pura (no librería) | No se justifica una dependencia para una sola barra de progreso con 3 estados de color |
| 5 | **Select nativo** para filtro de estado | Mientras no exista `nv-select`. Funcional y accesible. Se puede mejorar más adelante |
| 6 | **Sidebar fijo** con iconos | Primera feature operativa → la sidebar será base para features futuras. Diseño extensible |
| 7 | **Info grid 2 columnas** en detalle (md+) | Mejor uso de espacio en desktop. Colapsa a 1 columna en mobile |
| 8 | **Mini progress bar** en cada fila de la tabla | Feedback visual inmediato de ocupación sin necesidad de ir al detalle |
| 9 | **Skeleton loading** en lugar de spinner | Mejor UX, da sensación de carga más rápida, reduce layout shift |
| 10 | **Toast para feedback exitoso** | Consistente con patrón existente (`ToastService`). No interrumpe el flujo del usuario |
