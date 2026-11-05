# Feature: Redis Distributed Cache (Vikunja #59)
Multi-tenant distributed caching layer with Redis, Spring Cache, Lettuce pool, and transparent fallback.

## Specs
- S1: "Configurar conexión y pool de Redis en Spring Boot (`spring-boot-starter-data-redis` / Redisson)."
- S2: "Configurar `RedisCacheManager` con TTL por entidad y serialización JSON segura."
- S3: "me preocupa que la clave no tenga proteccion entre tenants, es algo que se maneja a nivel de logica de negocio, a mi parecer seria muchoo mas seguro que eso este directo en el ID para protejer aun mas la informacion" (TenantAwareKeyGenerator with tenant ID in key prefix).
- S4: "Cachear consultas de alta lectura: resumen de plazas (`SlotSummary`), tarifas activas (`Rates`) y configuraciones de parqueadero."
- S5: "Implementar invalidación de caché reactiva en mutaciones (`@CacheEvict` / eventos de dominio) para garantizar consistencia."
- S6: "Gestionar fallback transparente en caso de caída temporal del nodo Redis."
- S7: "Pruebas de integración con Testcontainers Redis."
- S8: "Esto deberia ser un enum, no le veo sentido usar class cuando tenemos algo nativo como los enum"
- S9: "seria buena idea tener el cache mediante variables de entorno, asi no se tiene que compilar cada vez que se quiera cambiar de TTL"
- S10: "para contexto sin authentificacion existe el prefix public, en este caso el prefix redis hace referencia a un contexto authentificado pero de scope tenant, al permiter que en caso de un error se guarde el dato como anonymous solo provoca un envenamiento del cache, ya que permite registrar datos privados de un tenant a un contexto global lo que permitira a un atacante acceder a esos datos que rompieron el aislamiento de tenant"
- S11: "Porue usas la anotacion autowired? aparte que tenes la ruta full"
- S12: "No me gustan esos if anidados, dentro de mis reglas estan darle la prioridad a erly returns, evitand al maximo el anidado de if a menos que sea la opcion mas comoda. Tambien no me gusta el hecho de que esta capa tenga logica de redis, cuandoe esta capa es meramente JPA,"
- S13: "Este test no validad nada, para saber si cumple con la aislamiento del tenant deberia haber dos registos de tenants diferente y probar con un id del parking perteneciente a un tenanat ajeno al loggeado"

## Tasks
- T1 (S1): Add Redis and cache starter dependencies, pool dependencies, and regenerate lockfile (inline) - done
- T2 (S2, S3, S6): Implement RedisCacheConfig, TenantAwareKeyGenerator, RedisCacheErrorHandler, and application.yaml properties (inline) - done
- T3 (S4, S5): Add caching and cache-eviction annotations to Slots, Rates, and ParkingLots repository adapters and event listeners (inline) - done
- T4 (S1): Add Redis service to Docker Compose files (deployment/compose*.yaml) (inline) - done
- T5 (S7): Implement integration tests with Testcontainers Redis verifying cache hits, eviction, and fallback (inline) - done
- T6 (S8, S9): Refactor CacheNames to enum and implement RedisCacheProperties with env-based TTLs (inline) - done
- T7 (S10): Secure TenantAwareKeyGenerator with fail-fast on null tenant and isolate public keys (inline) - done
- T8 (S11, S12): Clean JPA adapters of Redis/cache logic, remove @Autowired and nested ifs, restore @RequiredArgsConstructor (inline) - done
- T9 (S12): Implement Caching Repository Decorators in infrastructure/adapter/cache/repositories and thin PublicAvailabilityController (inline) - done
- T10 (S5): Verify and adapt reactive cache eviction listeners (inline) - done
- T11 (S13): Comprehensive multi-tenant isolation integration test with Testcontainers and unit tests (inline) - done

## Log
- L1: User request: "quiero que estudies planees la implementacion de la task #59 de vikunja"
- L2: User clarification: "me preocupa que la clave no tenga proteccion entre tenants, es algo que se maneja a nivel de logica de negocio, a mi parecer seria muchoo mas seguro que eso este directo en el ID para protejer aun mas la informacion"
- L3: User decision: "apruebo la implementacion"
- L4: PR #75 review feedback from user: enums for cache names, env var TTLs, no anonymous fallback in tenant keys, no redis in jpa adapters, early returns, no autowired, multi-tenant integration test
- L5: User decision: "aprobado papa"
