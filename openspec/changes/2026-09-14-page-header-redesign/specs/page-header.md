# Delta Spec: PageHeader Component

**Estado**: MODIFIED

## Requerimientos

### 1. Presentación Dual (Desktop y Mobile)
- **Dado** una vista con `PageHeaderComponent`
- **En pantalla de escritorio (`sm` en adelante)**: se renderiza una tarjeta completa (`rounded-2xl border border-border bg-card p-6 shadow-xs`) con icono de cabecera a la izquierda, píldora de historial `< >`, migas interactivas, título con `Badge` y slot `[actions]` alineado a la derecha.
- **En pantalla móvil (< `sm`)**: se renderiza un bloque vertical en 3 filas:
  1. Fila 1: Botón atrás, ruta actual compacta (`text-xs text-muted-foreground`) y badge.
  2. Fila 2: Icono de página junto a título y subtítulo.
  3. Fila 3: Acciones proyectadas con espaciado vertical y borde superior separador.

### 2. Integración de Componentes del Design System
- El encabezado debe utilizar componentes de `@nivo-sass/design-system`: `nv-h1`, `nv-muted`, `BadgeComponent`, etc., evitando estilos ad-hoc arbitrarios y respetando `conventions.md`.
