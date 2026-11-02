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

## Tasks
- T1 (S1): Add Redis and cache starter dependencies, pool dependencies, and regenerate lockfile (inline) - done
- T2 (S2, S3, S6): Implement RedisCacheConfig, TenantAwareKeyGenerator, RedisCacheErrorHandler, and application.yaml properties (inline) - done
- T3 (S4, S5): Add caching and cache-eviction annotations to Slots, Rates, and ParkingLots repository adapters and event listeners (inline) - done
- T4 (S1): Add Redis service to Docker Compose files (deployment/compose*.yaml) (inline) - done
- T5 (S7): Implement integration tests with Testcontainers Redis verifying cache hits, eviction, and fallback (inline) - done

## Log
- L1: User request: "quiero que estudies planees la implementacion de la task #59 de vikunja"
- L2: User clarification: "me preocupa que la clave no tenga proteccion entre tenants, es algo que se maneja a nivel de logica de negocio, a mi parecer seria muchoo mas seguro que eso este directo en el ID para protejer aun mas la informacion"
- L3: User decision: "apruebo la implementacion"
