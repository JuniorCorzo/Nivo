# Backend Java & Clean Architecture Standards

## Reglas Estrictas de Tipado e Inmutabilidad

- **Prohibición de `var`:** Prohibido `var` en backend. Variable local y parámetro exigen tipo concreto explícito.
- **Inmutabilidad Obligatoria (`final`):** Variable inmutable y parámetro de método DEBEN llevar `final` (ej. `final UUID parkingId`, `final LocalDate today = LocalDate.now();`).

## Controladores REST Delgados (Thin Controllers)

- **Responsabilidad Única de Transporte:** Controladores ultradelgados: mapeo rutas, validación (`@Valid`), negociación contenido, métricas infra.
- **Contexto de Seguridad en Casos de Uso:** Prohibido extraer `tenantId` en controlador para enviar a caso de uso. Inyectar `AuthenticationContextGateway` en caso de uso; resolver `tenantId` internamente.
- **Manejo Centralizado de Excepciones:** Prohibido `@ExceptionHandler` local para excepciones genéricas (ej. `IllegalArgumentException`). Errores dominio heredan `dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException`, manejados por `ExceptionHandlerController`.

## Diseño de Casos de Uso y Flujo de Control

- **Métodos `execute` como Orquestadores:** `execute` solo orquesta flujo. Bifurcación mayor (ej. sede vs consolidado inquilino) delega de inmediato a métodos privados.
- **Early Returns sin Escaleras de `else`:** Aplicar retornos tempranos (`early returns`). Eliminar bloques `else` redundantes.
- **Estilo Declarativo con Java Streams y Lambdas:** Preferir Java Streams (`map`, `filter`, `sum`, `collect`) y lambdas sobre bucles (`for`/`while`) con mutaciones.
- **Consultas Optimizadas en Repositorio (Anti-In-Memory Filtering):** Nunca cargar colección completa a memoria para filtrar último registro o agregar métricas. Usar métodos Spring Data JPA (ej. `findFirstBy...OrderBy...Desc`) en gateways de dominio.

## Contratos DTO y Documentación OpenAPI

- **Anotaciones `@Schema` Obligatorias:** DTOs REST exigen `@Schema` (`io.swagger.v3.oas.annotations.media.Schema`) en clase/record y campos (`description`, `example`). Garantiza interfaces TypeScript tipadas sin `unknown` vía `ng-openapi-gen`.

## Enrutamiento REST y Rutas Canónicas Únicas

- **Gestión Centralizada del Prefijo `/api`:** Sin `/v1`. Prefijo `/api` administrado centralmente vía context path (`server.servlet.context-path: /api`).
- **Ruta Relativa Única:** Prohibido declarar rutas múltiples en `@RequestMapping` (ej. `@RequestMapping({ "/api/v1/x", "/x", "/v1/x" })`); duplica operaciones en Scalar/Swagger. Usar ruta única (ej. `@RequestMapping("/x")`).
