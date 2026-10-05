# Delta Spec: Layout Component

**Estado**: MODIFIED

## Requerimientos

### 1. Detección de Viewport Móvil
El componente `LayoutComponent` debe detectar viewports menores a 768px (`Breakpoints.Small`, `Breakpoints.XSmall`).

#### Escenario: Viewport móvil detectado
- **Dado** que un usuario accede a la plataforma desde una pantalla <768px
- **Cuando** el layout se inicializa
- **Entonces** `isMobile` es `true` y la barra lateral fija no se renderiza en el flujo horizontal principal
- **Y** se muestra una barra superior móvil fija de 56px (`h-14`) con logo Nivo, badge de sede activa y botón hamburguesa.

### 2. Comportamiento del Drawer Móvil
- **Dado** que `isMobile` es `true`
- **Cuando** el usuario hace click en el botón de hamburguesa
- **Entonces** `mobileDrawerOpen` pasa a `true`
- **Y** la sidebar se muestra superpuesta con backdrop oscuro
- **Y** al pulsar en el backdrop o pulsar `Escape`, el drawer se cierra.

### 3. Auto-cierre tras navegación
- **Dado** que el drawer móvil está abierto
- **Cuando** el usuario hace click en un enlace de navegación y ocurre `NavigationEnd`
- **Entonces** `mobileDrawerOpen` pasa a `false` automáticamente.
