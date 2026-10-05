# Tareas: Rediseño de PageHeader y Navegación Declarativa

- [ ] 1. Crear `NavigationContextService` con Signals y actualizar `app.routes.ts` con `data.navContext`
  - [ ] 1.1 Escribir pruebas unitarias con TDD para `NavigationContextService`
  - [ ] 1.2 Implementar `NavigationContextService` con manejo de scopes `tenant` y `parking`, integrando `ActiveParkingService`
  - [ ] 1.3 Configurar `data.navContext` en `app.routes.ts`
- [ ] 2. Rediseñar `PageHeaderComponent` con estructura dual (Desktop y Mobile) y diseño simétrico
  - [ ] 2.1 Escribir pruebas unitarias con TDD para el renderizado Desktop y Mobile de `PageHeaderComponent`
  - [ ] 2.2 Actualizar plantilla y estilos de `PageHeaderComponent` usando `@nivo-sass/design-system`
- [ ] 3. Migrar la página de tarifas a `features/rates/page/rates-page/`
  - [ ] 3.1 Crear `rates-page` Smart Component con pruebas unitarias TDD
  - [ ] 3.2 Refactorizar `rates-list` para extraerlo como componente hijo
  - [ ] 3.3 Actualizar rutas en `app.routes.ts`
- [ ] 4. Integrar el nuevo `PageHeaderComponent` en las vistas objetivo
  - [ ] 4.1 Integrar en `parking-form` con botones Cancelar/Guardar en el header
  - [ ] 4.2 Integrar en `parking-home`
  - [ ] 4.3 Integrar en `operations-page`
  - [ ] 4.4 Integrar en `parking-slots-list`
  - [ ] 4.5 Integrar en `tickets-page`
  - [ ] 4.6 Ejecutar pruebas unitarias específicas de cada vista modificada
