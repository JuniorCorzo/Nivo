# Delta Spec: User Menu Component

**Estado**: MODIFIED

## Requerimientos

### 1. Trigger Interactivo Accesible
- **Dado** el componente `UserMenuComponent`
- **Cuando** el usuario interactúa con la tarjeta de perfil
- **Entonces** actúa como un botón accesible (`role="button"`, `aria-haspopup="menu"`, `aria-expanded`)
- **Y** soporta activación mediante Click, `Enter` y `Space`.

### 2. Despliegue de Popover hacia arriba
- **Dado** que el trigger es activado
- **Cuando** se abre el popover con CDK Overlay
- **Entonces** se posiciona flotante hacia arriba del footer
- **Y** muestra los detalles del usuario (nombre, correo, rol)
- **Y** aloja los controles de selección de tema (`ThemeButton`)
- **Y** aloja el botón de cerrar sesión (`LogoutButton`).

### 3. Cierre fuera de foco
- **Dado** que el popover está visible
- **Cuando** el usuario hace click fuera o presiona `Escape`
- **Entonces** el popover se cierra y el foco regresa al trigger.
