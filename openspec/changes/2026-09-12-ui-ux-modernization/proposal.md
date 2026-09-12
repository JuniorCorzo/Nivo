# Propuesta: Modernización UI/UX del Sistema Nivo (Tarea #60)

## Meta y Justificación
Optimizar la ergonomía y experiencia de usuario en la aplicación web (`apps/web`) adaptando la interfaz a dispositivos móviles mediante una sidebar oculta que se despliega como drawer lateral flotante, unificando los controles de sesión y apariencia en un User Menu popover interactivo en el pie de la navegación, y estandarizando los encabezados de página con `PageHeaderComponent` enriquecido con migas de pan (breadcrumbs) reactivas basadas en la sede activa de `ActiveParkingService`. Esta refactorización elimina la pérdida de espacio horizontal en pantallas táctiles, reduce el desorden visual en el pie de navegación y proporciona una jerarquía visual homogénea en todos los módulos de la plataforma.
