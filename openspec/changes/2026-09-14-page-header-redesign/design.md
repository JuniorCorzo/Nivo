# Diseño Técnico: Rediseño de PageHeader y Navegación Declarativa

## Arquitectura y Componentes

### 1. `NavigationContextService`
- **Responsabilidad**: Servicio `@Injectable({ providedIn: 'root' })` que reacciona a los eventos de navegación (`NavigationEnd`) y lee la metadata `data.navContext` de las rutas activas.
- **Modelo de Datos**:
  ```typescript
  export type NavigationScope = 'tenant' | 'parking';

  export interface RouteNavContext {
    scope: NavigationScope;
    title?: string;
    subtitle?: string;
    section?: string;
    backLink?: string;
    isRoot?: boolean;
  }
  ```
- **Reactividad con Signals**:
  - `navContext`: Signal con el contexto de ruta actual.
  - `scope`: Signal derivado (`tenant` | `parking`).
  - `breadcrumbs`: Signal computado con elementos `{ label, url?, icon? }`. Si `scope === 'parking'` y no es raíz, prepende el nombre activo resuelto vía `ActiveParkingService.activeParkingName()`.
  - `mobilePath`: Signal que concatena la jerarquía para móviles (ej. `Central Norte / Operaciones` o `Operaciones / Tickets`).
  - `backLink`: Signal con la URL anterior o enlace fallback.

### 2. `PageHeaderComponent` Dual y Responsivo
- **Modo Desktop (`hidden sm:flex`)**:
  - Contenedor envolvente: tarjeta con bordes redondeados (`rounded-2xl border border-border bg-card p-6 shadow-xs flex items-center justify-between gap-6`).
  - Lado izquierdo:
    - Contenedor de icono principal (`h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center`).
    - Navegación superior: Píldora de navegación de historial con botones `<` y `>` (`h-6 px-0.5 bg-muted border border-border rounded-md`), divisor vertical `|`, y lista de breadcrumbs con enlaces (`RouterLink`) y separadores `>`.
    - Fila de título: `nv-h1` con truncamiento elíptico, acompañado opcionalmente de `nv-badge` o slot `[badge]`.
    - Subtítulo: `nv-muted` con información descriptiva o slot `[subtitle]`.
  - Lado derecho:
    - Slot `[actions]` para botones de acción (`nv-button`) agrupados horizontalmente.
- **Modo Mobile (`flex flex-col space-y-3.5 p-4 rounded-2xl border border-border bg-card shadow-xs sm:hidden`)**:
  - Fila 1: Botón atrás (`h-7 w-7 rounded-lg border border-border bg-muted`), texto de ruta actual truncado (`text-xs text-muted-foreground font-medium`), y badge de estado.
  - Fila 2: Icono de cabecera (`h-10 w-10 rounded-xl bg-primary/10`) + columna con título (`text-base font-bold`) y subtítulo (`text-xs text-muted-foreground`).
  - Fila 3: Contenedor de acciones apiladas o en grilla (`space-y-2 pt-1 border-t border-border/60`).

### 3. Migración y Reestructuración de `Rates`
- Crear `apps/web/src/app/features/rates/page/rates-page/rates-page.{ts,html,spec.ts}`:
  - Smart container que aloja `app-page-header` y los tabs interactivos (`Tarifas`, `Calculadora`, `Políticas`).
  - Carga diferida en `app.routes.ts` para la ruta `/app/parking-lots/:parkingId/rates`.
- Refactorizar `RateListComponent`:
  - Permanece en `apps/web/src/app/features/rates/components/rates-list/` enfocado exclusivamente en renderizar la cuadrícula de tarifas, buscador y filtros.

### 4. Integración en Vistas
- **`parking-form`**: Mover las acciones `Cancelar` y `Guardar Cambios` al header en el slot `[actions]`, con el enlace atrás y breadcrumbs `Parqueaderos > Configurar Parqueadero`.
- **`parking-home`**: Header con título de la sede activa, badge `● Abierto`, subtítulo con dirección/plazas/moneda, y acciones agrupadas.
- **`operations`**: Header con badge animado `● En Vivo`, botón `Registrar Ingreso` y enlace a `Ver Tickets`.
- **`slots`**: Header con badge de total de cupos, botón `+ Crear Plazas` y `Editar Grupo`.
- **`tickets`**: Header que distingue el scope `tenant` (`/app/tickets`) del scope `parking` (`/app/parking-lots/:id/tickets`).
