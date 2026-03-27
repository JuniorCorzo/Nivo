# 2. Paleta de colores - Sistema Zinc

Nivo adopta un sistema visual inspirado en **shadcn/ui**: neutros basados en la escala **Zinc** de Tailwind CSS, componentes de alto contraste y colores semánticos reservados exclusivamente para estados funcionales. No hay un color de marca decorativo; la identidad se construye desde la tipografía, la composición y el contraste.

## Escala Zinc completa (referencia)

| Token    | HEX       | HSL                     |
| -------- | --------- | ----------------------- |
| zinc-50  | `#fafafa` | `hsl(0, 0%, 98%)`       |
| zinc-100 | `#f4f4f5` | `hsl(240, 5.9%, 90%)`   |
| zinc-200 | `#e4e4e7` | `hsl(240, 5.9%, 90%)`   |
| zinc-300 | `#d4d4d8` | `hsl(240, 4.9%, 83.9%)` |
| zinc-400 | `#a1a1aa` | `hsl(240, 4.9%, 65.1%)` |
| zinc-500 | `#71717a` | `hsl(240, 3.8%, 46.1%)` |
| zinc-600 | `#52525b` | `hsl(240, 5.2%, 34.1%)` |
| zinc-700 | `#3f3f46` | `hsl(240, 5.3%, 26.1%)` |
| zinc-800 | `#27272a` | `hsl(240, 3.7%, 15.9%)` |
| zinc-900 | `#18181b` | `hsl(240, 5.9%, 10%)`   |
| zinc-950 | `#09090b` | `hsl(240, 10%, 3.9%)`   |

## Tema oscuro

**Colores de base (neutros)**

*   **Background** - `#09090b`
    *   HSL: `hsl(240, 10%, 3.9%)`
    *   **Uso**: Fondo principal de la aplicación.
*   **Card** - `#09090b`
    *   HSL: `hsl(240, 10%, 3.9%)`
    *   **Uso**: Tarjetas y paneles, separados por borde sutil y no por fondo.
*   **Popover** - `#09090b`
    *   **Uso**: Modales, dropdowns y tooltips.
*   **Foreground** - `#fafafa`
    *   HSL: `hsl(0, 0%, 98%)`
    *   **Uso**: Texto principal y contenido de alta legibilidad.
*   **Muted Foreground** - `#a1a1aa`
    *   HSL: `hsl(240, 4.9%, 65.1%)`
    *   **Uso**: Texto secundario, labels, placeholders y descripciones.
*   **Muted** - `#27272a`
    *   HSL: `hsl(240, 3.7%, 15.9%)`
    *   **Uso**: Fondos de badges, botones secundarios y áreas inactivas.

**Colores de componentes**

*   **Primary** - `#fafafa` (Texto: `#18181b`)
    *   **Uso**: Fondo de botón principal y elementos de acción primaria.
*   **Secondary** - `#27272a` (Texto: `#fafafa`)
    *   **Uso**: Fondo de botón secundario y toggle inactivo.
*   **Accent** - `#27272a`
    *   **Uso**: Hover en sidebar, item de menú activo y fondo de selección.
*   **Border / Input** - `#27272a`
    *   **Uso**: Bordes de tarjetas, divisores y formularios.
*   **Ring** - `#d4d4d8`
    *   **Uso**: Anillo de foco (`focus-visible`).

**Colores semánticos (estados)**

*   **Destructive** - `#7f1d1d` (Texto: `#fafafa`) - Errores, plazas ocupadas.
*   **Success** - `#22c55e` - Plazas disponibles, check-in exitoso.
*   **Warning** - `#eab308` - Advertencias, reservas pendientes.
*   **Info** - `#3b82f6` - Mensajes informativos, tooltips.

---

## Tema claro

**Colores de base (neutros)**

*   **Background / Card / Popover** - `#ffffff`
    *   HSL: `hsl(0, 0%, 100%)`
    *   **Uso**: Fondo principal.
*   **Foreground** - `#09090b`
    *   HSL: `hsl(240, 10%, 3.9%)`
    *   **Uso**: Texto principal.
*   **Muted Foreground** - `#71717a`
    *   **Uso**: Texto secundario.
*   **Muted** - `#f4f4f5`
    *   **Uso**: Fondos sutiles.

**Colores de componentes**

*   **Primary** - `#18181b` (Texto: `#fafafa`)
*   **Secondary** - `#f4f4f5` (Texto: `#18181b`)
*   **Accent** - `#f4f4f5`
*   **Border / Input** - `#e4e4e7`
*   **Ring** - `#18181b`

**Colores semánticos (estados)**

*   **Destructive** - `#ef4444` (Texto: `#fafafa`)
*   **Success** - `#16a34a`
*   **Warning** - `#ca8a04`
*   **Info** - `#2563eb`

---

## Distribución de colores

**Por frecuencia de uso:**

- **Neutros (Background / Foreground / Border)**: 80% - Fondos, estructura, texto y bordes.
- **Primary (blanco/negro invertido)**: 10% - CTAs y botones principales.
- **Semánticos (Success / Warning / Destructive / Info)**: 10% - Solo para estados funcionales.

**Principio clave:** El color es informativo, no decorativo. Los estados semánticos son los únicos elementos con color cromático.