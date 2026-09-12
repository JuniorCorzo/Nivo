# Delta Spec: Sidebar Component

**Estado**: MODIFIED

## Requerimientos

### 1. Despliegue en modo Drawer y modo Desktop
- **Dado** un dispositivo de escritorio (>=768px)
- **Cuando** se visualiza la sidebar
- **Entonces** mantiene su funcionalidad colapsable existente entre ancho completo y solo iconos.

- **Dado** un dispositivo móvil (<768px)
- **Cuando** se despliega dentro del Drawer
- **Entonces** se muestra a ancho completo de navegación con botón explícito de cierre (X) en su cabecera.

### 2. Pie de Navegación Simplificado
- **Dado** el componente `SidebarFooter`
- **Cuando** se renderiza
- **Entonces** contiene exclusivamente el componente `<app-user-menu [collapsed]="collapsed()" />`, delegando el cambio de tema y logout dentro de su popover.
