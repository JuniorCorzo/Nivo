## Context

El proyecto Nivo es una plataforma multi-inquilino para gestión de parqueaderos. La historia de usuario ANC-13 (HU-01) establece el contrato de comportamiento para registro y login. Este change (ANC-14) implementa la capa visual/frontend de ese contrato.

El frontend está en `apps/web/` dentro de un monorepo Nx. El stack es **Angular 21 + TypeScript**. No existe actualmente ningún flujo de autenticación implementado en el cliente.

**Restricciones:**

- La autenticación es multi-inquilino: cada usuario pertenece a un parqueadero (tenant)
- Los tokens deben manejarse de forma segura (no en localStorage si es posible)
- La interfaz debe ser responsiva y accesible (WCAG AA mínimo)

## Goals / Non-Goals

**Goals:**

- Crear los componentes visuales de registro y login con Angular
- Implementar validación en tiempo real con Reactive Forms (`@angular/forms`)
- Manejar sesiones (token storage, renovación automática, logout)
- Redirigir al panel correcto según el rol del usuario autenticado
- Componentes reutilizables y accesibles

**Non-Goals:**

- Implementación del backend de autenticación (ya existe o es ANC-13 backend)
- Gestión de roles avanzada más allá del redirect inicial
- Recuperación de contraseña (fuera de alcance de HU-01)
- Testing E2E (se cubre en un change separado)

## Decisions

### D1: Manejo de tokens — httpOnly cookies sobre localStorage

**Decisión**: Usar httpOnly cookies para el access token gestionadas por el servidor, y NO guardar tokens en localStorage ni sessionStorage.

**Rationale**: localStorage es vulnerable a XSS. httpOnly cookies no son accesibles desde JavaScript, eliminando ese vector. Como fallback seguro: access token en memoria (service con Signal/BehaviorSubject) + refresh token en httpOnly cookie.

**Alternativas consideradas**:

- localStorage: simple pero inseguro (XSS)
- sessionStorage: mejor que localStorage pero se pierde al cerrar tab

---

### D2: Manejo de formularios — Angular Reactive Forms (`@angular/forms`)

**Decisión**: Usar **Reactive Forms** de Angular nativo (`FormGroup`, `FormControl`, `Validators`) para el manejo de estado y validaciones de formularios.

**Rationale**: Ya está en el proyecto (`@angular/forms ~21.2.0`), no requiere dependencias externas, es el estándar Angular para formularios complejos con validaciones, y ofrece control total sobre el estado del form vía observables RxJS. Template-driven forms son descartados por su menor testeabilidad y control limitado.

**Alternativas consideradas**:

- Template-driven forms: menos control, más difícil de testear unitariamente
- Librerías externas (ngx-formly, etc.): overhead innecesario para este caso

---

### D3: Validaciones personalizadas — Angular custom validators

**Decisión**: Implementar validadores personalizados como funciones puras de Angular (`ValidatorFn`) para reglas como "contraseñas coinciden" o "formato de email específico del dominio".

**Rationale**: Cohesión total con el ecosistema Angular, type-safe, reutilizables entre formularios, fácilmente testeables con jest.

---

### D4: Estado de autenticación — Angular Signals (`signal`, `computed`)

**Decisión**: Usar **Angular Signals** (Angular 16+, estable en v21) para el estado global de autenticación en un `AuthService`.

**Rationale**: Angular 21 tiene Signals maduros y es la dirección oficial del framework. Más ergonómico que BehaviorSubject para estado sincrónico, sin necesidad de gestionar subscripciones. Mejor integración con la detección de cambio de Angular (OnPush).

**Alternativas consideradas**:

- BehaviorSubject/Observable: más verboso, requiere `async` pipe o manejo manual de suscripciones
- NgRx: overhead excesivo para el alcance actual de este change

---

### D5: Intercepción HTTP — Angular `HttpInterceptor`

**Decisión**: Usar un `HttpInterceptor` para manejar automáticamente el refresco de tokens en respuestas 401, sin intervención manual en cada llamada a la API.

**Rationale**: Es el patrón estándar Angular para cross-cutting concerns en HTTP. Centraliza la lógica de autenticación en un solo lugar.

---

### D6: Protección de rutas — Angular Route Guards (`CanActivate`)

**Decisión**: Usar **functional guards** de Angular Router (`CanActivateFn`) para proteger las rutas del dashboard y redirigir usuarios no autenticados.

**Rationale**: Functional guards (Angular 15+) son más simples que los basados en clases, fácilmente testeables y son el patrón recomendado en Angular moderno.

---

### D7: Feedback de errores — inline en template

**Decisión**: Errores de campo se muestran inline debajo del input usando `*ngIf` o `@if` sobre `control.hasError()`. Errores globales de API se muestran como mensaje prominente en el formulario.

**Rationale**: Los toasts son efímeros y pueden perderse. Los errores de autenticación requieren que el usuario los vea claramente. Angular 17+ `@if` es el mecanismo recomendado sobre `*ngIf`.

## Risks / Trade-offs

- **[Riesgo] Contrato de API desconocido** → Los endpoints del backend pueden no estar definidos aún. Mitigación: usar un servicio mock (`AuthServiceMock`) o interceptor de desarrollo para simular respuestas durante el desarrollo frontend.
- **[Riesgo] Token refresh race condition** → Si múltiples requests fallan con 401 simultáneamente, el interceptor podría lanzar múltiples refresh. Mitigación: usar un flag `isRefreshing` + cola de requests pendientes con un Subject de RxJS.
- **[Trade-off] Signals vs Observable para auth state** → Signals son más simples pero si el resto del proyecto usa Observables extensamente, mezclar paradigmas puede generar fricción. Evaluar consistencia con el código existente antes de implementar.
