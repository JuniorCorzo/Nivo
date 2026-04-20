# 🏗️ Arquitectura del Proyecto Nivo

Nivo es un sistema multi-tenant de gestión de estacionamientos, organizado como un **monorepo** que separa claramente las responsabilidades entre el core de negocio, la interfaz de usuario y los estándares de diseño.

## 🧩 Estructura General

El proyecto utiliza una estructura de monorepo dividida en:

- `apps/`: Aplicaciones ejecutables (API y Web).
- `libs/`: Librerías compartidas y el Design System.
- `database/`: Definiciones de esquema SQL.
- `deployment/`: Configuraciones de contenedores y orquestación.

---

## ⚙️ Backend (apps/api)

El backend está construido con **Java 21** y **Spring Boot 3.5.4**, siguiendo estrictamente los principios de **Clean Architecture** mediante el **Scaffold de Bancolombia**.

### Capas de Clean Architecture:
1.  **Domain**: El núcleo del negocio, sin dependencias externas.
    - `domain/model`: Entidades de negocio y definiciones de `gateways` (interfaces de repositorio).
    - `domain/usecase`: Lógica de negocio pura que orquestra los modelos.
2.  **Infrastructure**: Implementaciones tecnológicas concretas.
    - `driven-adapters`: Implementaciones de los gateways (JPA, REST Clients, etc.).
    - `entry-points`: Controladores REST y puntos de entrada de datos.
3.  **Applications**: Capa de configuración y arranque (`app-service`).

---

## 🌐 Frontend (apps/web)

La interfaz de usuario principal es una aplicación **Angular 20+** moderna.

- **Arquitectura**: Basada en **Standalone Components** para reducir la complejidad de los módulos.
- **Estilos**: Integración con Tailwind CSS y el Design System local.
- **Comunicación**: Consume la API mediante servicios Angular generados o definidos manualmente.

---

## 🎨 Design System (libs/design-system)

Librería de componentes UI reutilizables construida con Angular.

- **Design Tokens**: Centralización de colores, tipografía y espaciado (vía CSS Variables).
- **Componentes**: Biblioteca de componentes atómicos (`nv-button`, `nv-input`, etc.).
- **Storybook**: Utilizado para la documentación visual y testing de componentes de forma aislada.

---

## 🗄️ Persistencia y Despliegue

- **Base de Datos**: PostgreSQL (en producción) / H2 (en desarrollo/memoria).
- **Migraciones**: Gestionadas (potencialmente) por Flyway.
- **Contenedores**: Docker y Docker Compose para orquestar la API, la DB y otros servicios necesarios.

---

## 🛠️ Herramientas de Desarrollo

- **Gradle**: Gestión de dependencias y builds para el backend.
- **NPM/Bun**: Gestión de dependencias para el frontend y el design system.
- **Jacoco/Pitest**: Aseguramiento de la calidad mediante cobertura de tests y testing de mutación.
