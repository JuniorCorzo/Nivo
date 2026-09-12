# Delta Spec: PageHeader Component

**Estado**: MODIFIED

## Requerimientos

### 1. Migas de Pan (Breadcrumbs) Contextuales
- **Dado** una vista con `PageHeaderComponent` sin input explícito de `breadcrumbs`
- **Cuando** existe una sede activa en `ActiveParkingService`
- **Entonces** el header despliega en la parte superior la ruta: `[Nombre Parqueadero Activo] / [Título]`
- **Y** si no existe sede activa, despliega solo el título o jerarquía base.

### 2. Soporte de Breadcrumbs Explícitos
- **Dado** una vista secundaria o de formulario
- **Cuando** se proporciona `[breadcrumbs]="[{ label: 'Parqueadero Central' }, { label: 'Plazas', url: '/app/slots' }, { label: 'Crear' }]"`
- **Entonces** el componente renderiza la lista completa de migas con enlaces interactivos según corresponda.

### 3. Estandarización de Páginas
- **Dado** las vistas de la aplicación (`ParkingHome`, `ParkingSlotsListPage`, `RateListComponent`, formularios)
- **Cuando** se accede a cada una
- **Entonces** la cabecera está gobernada de forma idéntica por `app-page-header`, garantizando consistencia tipográfica, jerarquía y espaciado según `conventions.md`.
