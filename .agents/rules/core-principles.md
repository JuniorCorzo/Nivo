# Core Engineering Principles

## SOLID Principles (Angular / TypeScript Context)

- **Single Responsibility Principle (SRP):** One reason to change per component, service, directive. UI in components; state and logic in facades or services.
- **Open/Closed Principle (OCP):** Extend via composition, content projection (`<ng-content>`), directives, DI; never modify existing entities.
- **Liskov Substitution Principle (LSP):** Services and controls (e.g. `ControlValueAccessor` / Form controls) must satisfy contracts without breaking caller assumptions.
- **Interface Segregation Principle (ISP):** Lean interfaces and dedicated InjectionTokens over monolithic contracts.
- **Dependency Inversion Principle (DIP):** Depend on abstractions (interfaces, abstract classes, `InjectionToken`). Inject via `inject()`; avoid concrete coupling.

## Simplicity & Pragmatism

- **KISS (Keep It Simple, Stupid):** Prefer simple, declarative, readable code over complex abstractions.
- **YAGNI (You Aren't Gonna Need It):** Build only current requirements. Zero speculative code.
