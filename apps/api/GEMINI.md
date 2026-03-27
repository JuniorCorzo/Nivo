# Gemini Project Context: Nivo API

## 1. Project Overview

This project is the backend API for "Nivo", a multi-tenant parking management system. It is built with Java 21 and the Spring Boot framework.

The architecture is a key feature, strictly following the principles of **Clean Architecture** using the **"Scaffold de Bancolombia"**. This is a template and a set of Gradle plugins that enforce a modular, decoupled, and maintainable codebase.

- **Core Technologies:** Java 21, Spring Boot 3.5.4, Gradle 8.14.3
- **Testing:** JUnit 5, Jacoco (coverage), Pitest (mutation testing)
- **Database:** Uses H2 in-memory database for development, as configured in `application.yaml`.
- **Architecture:** Clean Architecture with distinct layers for Domain, Infrastructure, and Application.

## 2. Building and Running

The project is managed with the Gradle wrapper (`gradlew`).

- **To Run the Application:**
  ```bash
  ./gradlew bootRun
  ```
  The server will start on port 8080 by default.

- **To Build the Project:**
  ```bash
  ./gradlew build
  ```

- **To Run Tests:**
  ```bash
  ./gradlew test
  ```

## 3. Architecture and Development Conventions

### 3.1. Directory Structure and Layers

The project is divided into the following primary modules:

- **`domain`**: The heart of the application, with no dependencies on other layers.
    - **`domain/model`**: Contains the business entities (e.g., `Users.java`) and the repository interfaces (`gateways`). These interfaces define the contracts for data persistence.
    - **`domain/usecase`**: Contains the specific business logic (use cases) that orchestrate the model entities to perform tasks.

- **`infrastructure`**: Contains concrete technology implementations. It depends on the domain, but not the other way around.
    - **`infrastructure/driven-adapters`**: Implementations of the `gateway` interfaces defined in the domain. For example, a repository to connect to a PostgreSQL database or a client for an external REST service.
    - **`infrastructure/entry-points`**: Entry points to the application from the outside world, typically REST controllers that expose the use cases.
    - **`infrastructure/helpers`**: Utility classes for the infrastructure layer.

- **`applications`**: The outermost layer, responsible for configuring and running the application.
    - **`applications/app-service`**: Contains the main application class (`MainApplication.java`), dependency injection configuration, and configuration files (`application.yaml`). It wires all the pieces together.

### 3.2. Code Generation

The `co.com.bancolombia.cleanArchitecture` plugin provides helpful Gradle tasks to scaffold new components while respecting the architecture rules:

- **`generateModel` (`gm`):** Creates a new business entity in `domain/model`.
- **`generateUseCase` (`guc`):** Creates a new use case in `domain/usecase`.
- **`generateEntryPoint` (`gep`):** Generates an entry point (e.g., a REST controller).
- **`generateDrivenAdapter` (`gda`):** Generates a driven adapter (e.g., a JPA repository).
- **`validateStructure` (`vs`):** Validates that dependency rules between layers are not violated.

### 3.3. Request Flow Example

1.  An HTTP request arrives at a **REST Controller** in `infrastructure/entry-points`.
2.  The controller calls a **Use Case** in `domain/usecase`, passing the necessary data.
3.  The use case executes the business logic, using **Entities** from `domain/model`.
4.  If data access is needed, the use case invokes a method on a **repository interface** (`gateway`) from `domain/model`.
5.  Dependency injection (configured in `applications/app-service`) provides the concrete implementation of the interface from `infrastructure/driven-adapters`.
6.  The adapter interacts with the database and returns data to the use case.
7.  The use case completes its logic and returns the result to the controller.
8.  The controller transforms the result into an HTTP response and sends it to the client.
