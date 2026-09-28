# Core Engineering Principles

## SOLID Principles (Angular / TypeScript Context)

- **Single Responsibility Principle (SRP):** Each component, service, or directive should have one, and only one, reason to change. Components focus on UI rendering; state and business logic are delegated to facades or services.
- **Open/Closed Principle (OCP):** Entities are open for extension via composition, content projection (`<ng-content>`), directives, and dependency injection, but closed for modification.
- **Liskov Substitution Principle (LSP):** Service implementations and custom controls (e.g. `ControlValueAccessor` / Form controls) must fulfill their contracts without breaking caller expectations.
- **Interface Segregation Principle (ISP):** Depend on lean interfaces and dedicated InjectionTokens rather than monolithic contracts.
- **Dependency Inversion Principle (DIP):** Depend on abstractions (interfaces, abstract classes, `InjectionToken`) and inject dependencies via `inject()` rather than concrete tight-coupling.

## Simplicity & Pragmatism

- **KISS (Keep It Simple, Stupid):** Prefer simple, declarative, and readable solutions over over-engineered abstractions.
- **YAGNI (You Aren't Gonna Need It):** Build only what is needed for the current requirements; avoid premature abstractions.
