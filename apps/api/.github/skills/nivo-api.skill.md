# Nivo API — Code Style & Architecture Guide

Spring Boot 4.0.3, Java 25, Gradle. Clean Architecture enforced via Bancolombia Scaffold plugin.

## Module Layout

```
apps/api/
├── domain/
│   ├── model/        # Entities, value objects, gateway interfaces (NO external deps)
│   └── usecase/      # Business logic — depends only on domain/model
├── infrastructure/
│   ├── driven-adapters/  # Gateway implementations (JPA, payment clients)
│   ├── entry-points/     # REST controllers, WebSocket handlers
│   └── helpers/          # Security utilities
└── applications/
    └── app-service/  # Main class, DI wiring, application.yaml
```

**Dependency rule:** outer → inner only. Domain has zero framework imports.

## Scaffold Commands (prefer over hand-writing boilerplate)

```bash
./gradlew gm  --name=<ModelName>        # New entity in domain/model
./gradlew guc --name=<UseCaseName>      # New use case in domain/usecase
./gradlew gda --type=<type> --name=<N>  # Driven adapter in infrastructure
./gradlew gep --type=<type> --name=<N>  # Entry point in infrastructure
./gradlew vs                            # Validate architecture structure
```

## Build & Test

```bash
# From apps/api/
./gradlew test                          # All tests
./gradlew :domain:usecase:test          # Module-scoped test
./gradlew test --tests "dev.angelcorzo.nivo.SomeTest"
./gradlew test --tests "dev.angelcorzo.nivo.SomeTest.someMethod"
./gradlew test jacocoTestReport         # With coverage
./gradlew pitest                        # Mutation testing (target 80%+)
./gradlew check                         # All verification checks
```

## Naming Conventions

| Element | Pattern | Example |
|---------|---------|---------|
| Packages | lowercase | `dev.angelcorzo.nivo.model.parkingtickets` |
| Classes | PascalCase | `CheckOutVehicleUseCase` |
| Methods/Variables | camelCase | `execute()`, `ticketId` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Use Cases | `*UseCase` | `CheckOutVehicleUseCase` |
| Controllers | `*Controller` | `ParkingTicketsController` |
| Repositories/Gateways | `*Repository` | `ParkingTicketsRepository` |
| DTOs | `*DTO` or descriptive record | `ParkingTicketsDTO`, `CreateTicket` |

## Java Code Conventions

```java
// Constructor injection via Lombok — never @Autowired
@RequiredArgsConstructor
public class CheckOutVehicleUseCase {
  private final ProcessPaymentUseCase processPayment;
  private final ParkingTicketsRepository parkingTicketsRepository;

  // Records for immutable commands/DTOs
  public record CheckOutCommand(UUID ticketId, String email) {}

  // Chain calls on separate lines when exceeding 100 chars
  public Payments execute(CheckOutCommand command) {
    return this.parkingTicketsRepository
        .findById(command.ticketId())
        .orElseThrow(() -> new ProcessPaymentException(
            new PaymentError.TicketNotFound(command.ticketId())));
  }
}
```

- Prefer `records` for immutable DTOs/commands/value objects.
- Use `@Builder` (Lombok) for complex mutable objects.
- `final` on all local variables and fields that don't change.
- No `var` — explicit types for readability.
- Line limit: 100 characters.

## Import Order

1. `java.*` / `javax.*`
2. External libraries (Spring, Lombok, Jackson…)
3. Internal project imports (grouped by module, alphabetical)

No wildcard imports.

## Error Handling

- Custom exceptions live in `domain/model` — no framework deps.
- All exceptions extend a base `AppException` that carries an HTTP status.
- `@ControllerAdvice` in entry-points maps exceptions to `ResponseError` DTO.
- Never swallow exceptions silently; always log or rethrow with context.

## Testing Standards

- File: `src/test/java`, class name: `ClassNameTest.java`
- Framework: JUnit 5 + Spring Boot Test
- Pattern: Arrange / Act / Assert (one blank line between sections)
- Mock boundaries (gateways) with Mockito; never mock domain objects
- Every use case must have unit tests; adapters need integration tests
- Mutation coverage target: 80%+ via PIT

## Spring Conventions

- Constructor injection only (`@RequiredArgsConstructor`)
- `@Transactional` on repository adapter methods, not on use cases
- `@PreAuthorize` for role-based access — never inline security checks
- Config in `applications/app-service/src/main/resources/application.yaml`

## Database

- Flyway migrations: `src/main/resources/db/migration/V<n>__description.sql`
- JPA adapter in `infrastructure/driven-adapters/jpa-repository`
- Entity classes (JPA) stay in the adapter, never in domain/model
- Domain entities are plain Java objects — no `@Entity` in domain

## Security

- JWT via RSA key pairs (configured in app-service)
- Passwords: BCrypt
- Access control: `@PreAuthorize` with Spring Security expressions
