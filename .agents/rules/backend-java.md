# Backend Java & Clean Architecture Standards

## Reglas Estrictas de Tipado e Inmutabilidad

- **Prohibición de `var`:** Está estrictamente prohibido el uso de `var` en el backend. Toda variable local y parámetro debe especificar su tipo concreto explícitamente.
- **Inmutabilidad Obligatoria (`final`):** Toda variable que no mute y todo parámetro de método DEBE llevar el modificador `final` (ej. `final UUID parkingId`, `final LocalDate today = LocalDate.now();`).

## Controladores REST Delgados (Thin Controllers)

- **Responsabilidad Única de Transporte:** Los controladores REST deben permanecer ultradelgados, limitándose a mapeo de rutas, validación de entrada (`@Valid`), negociación de contenido y métricas de infraestructura.
- **Contexto de Seguridad en Casos de Uso:** Prohibido resolver o extraer `tenantId` en los controladores para pasarlo como parámetro al caso de uso. Inyectar `AuthenticationContextGateway` directamente en el caso de uso y resolver `tenantId` internamente.
- **Manejo Centralizado de Excepciones:** Prohibido definir `@ExceptionHandler` locales en controladores para excepciones genéricas (ej. `IllegalArgumentException`). Todo error de dominio debe modelarse con una excepción personalizada que herede de `dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException`, la cual es gestionada globalmente por `ExceptionHandlerController`.

## Diseño de Casos de Uso y Flujo de Control

- **Métodos `execute` como Orquestadores:** El método `execute` debe limitarse a coordinar el flujo. Si existen bifurcaciones significativas (ej. sede individual vs. consolidado de inquilino), el flujo debe delegarse inmediatamente a métodos privados especializados.
- **Early Returns sin Escaleras de `else`:** Siempre que sea viable, utilizar retornos tempranos (`early returns`) y eliminar bloques `else` redundantes.
- **Estilo Declarativo con Java Streams y Lambdas:** Preferir pipelines de Java Streams (`map`, `filter`, `sum`, `collect`) y lambdas frente a bucles iterativos imperativos (`for`/`while`) con acumuladores mutables.
- **Consultas Optimizadas en Repositorio (Anti-In-Memory Filtering):** Nunca cargar colecciones completas a memoria para filtrar el último registro o calcular métricas agregadas. Diseñar métodos específicos en los repositorios de Spring Data JPA (ej. `findFirstBy...OrderBy...Desc`) y exponerlos en los gateways de dominio.

## Contratos DTO y Documentación OpenAPI

- **Anotaciones `@Schema` Obligatorias:** Todo DTO expuesto a través de endpoints REST debe estar documentado con `@Schema` (`io.swagger.v3.oas.annotations.media.Schema`) tanto a nivel de clase/record como en cada uno de sus campos, incluyendo `description` y `example`. Esto asegura que herramientas como `ng-openapi-gen` en el frontend generen interfaces TypeScript tipadas y documentadas sin tipos `unknown`.

## Enrutamiento REST y Rutas Canónicas Únicas

- **Gestión Centralizada del Prefijo `/api`:** En el backend no se utiliza versionado `/v1`. El prefijo global `/api` es administrado centralmente por el servlet context path (`server.servlet.context-path: /api`).
- **Ruta Relativa Única:** En los controladores REST (`@RequestMapping`), está prohibido definir arreglos con múltiples rutas alternativas (ej. `@RequestMapping({ "/api/v1/x", "/x", "/v1/x" })`), ya que SpringDoc registra cada variante como una operación separada, duplicando la documentación en Scalar/Swagger. Utilizar una única ruta relativa limpia (ej. `@RequestMapping("/x")`).
