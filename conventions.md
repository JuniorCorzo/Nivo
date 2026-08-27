# Project Conventions

## Core Engineering Principles

### SOLID Principles (Angular / TypeScript Context)
- **Single Responsibility Principle (SRP):** Each component, service, or directive should have one, and only one, reason to change. Components focus on UI rendering; state and business logic are delegated to facades or services.
- **Open/Closed Principle (OCP):** Entities are open for extension via composition, content projection (`<ng-content>`), directives, and dependency injection, but closed for modification.
- **Liskov Substitution Principle (LSP):** Service implementations and custom controls (e.g. `ControlValueAccessor` / Form controls) must fulfill their contracts without breaking caller expectations.
- **Interface Segregation Principle (ISP):** Depend on lean interfaces and dedicated InjectionTokens rather than monolithic contracts.
- **Dependency Inversion Principle (DIP):** Depend on abstractions (interfaces, abstract classes, `InjectionToken`) and inject dependencies via `inject()` rather than concrete tight-coupling.

### Simplicity & Pragmatism
- **KISS (Keep It Simple, Stupid):** Prefer simple, declarative, and readable solutions over over-engineered abstractions.
- **YAGNI (You Aren't Gonna Need It):** Build only what is needed for the current requirements; avoid premature abstractions.

---

## Angular Component Principles

- **Single Responsibility:** One component fulfills one specific UI task or logic block. Standalone components stay lightweight and delegate side effects to services.
- **Reusability & Dynamic Inputs:** Driven by dynamic signal inputs (`input()`, `input.required()`, `model()`) to adapt across different views.
- **Unidirectional Data Flow & Signals:** Data flows down via Signal inputs; state changes flow up via `output()`. Leverage Angular Signals (`computed()`, `linkedSignal()`) for fine-grained reactivity.
- **Encapsulation & Performance:** Enforce `ChangeDetectionStrategy.OnPush` across all components. Keep component styles scoped (`ViewEncapsulation.Emulated`).
- **Composition & Modern Control Flow:** Compose complex UIs by nesting smaller standalone components using native template control flow (`@if`, `@for`, `@switch`, `@defer`).
- **Separation of Concerns (Container / Presentational):** Decouple presentational (dumb) components (pure UI, signal inputs/outputs) from container (smart) components or facades managing state, injection (`inject()`), and async data streams (`resource()`, `rxResource()`, RxJS).
- **Accessibility (a11y):** Embed semantic HTML, appropriate ARIA attributes, focus management, and Angular CDK primitives directly into the component structure.
