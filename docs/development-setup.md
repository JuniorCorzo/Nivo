# Local Development Setup Guide

This guide explains how to set up, build, and run the **Nivo** application locally on your workstation.

---

## 1. Prerequisites

Ensure the following runtimes and tools are installed on your workstation:
- **Java Development Kit (JDK) 25** (or compatible modern OpenJDK)
- **Bun 1.3+** (Package manager & task runner for frontend & mono-repo)
- **Docker & Docker Compose** (For running local PostGIS container)
- **OpenSSL CLI** (For generating RSA & AES keys)

---

## 2. Step-by-Step Setup

### Step 1: Start the Local PostGIS Database
Run the local development database service:

```bash
bun run dev:db
```
*Alternatively: `docker compose -f deployment/compose.dev.yaml up -d`*

To view database logs:
```bash
bun run dev:db:logs
```

To stop the database:
```bash
bun run dev:db:down
```

### Step 2: Generate Cryptographic Keys
Generate local development RSA keys for JWT signing and verification:

```bash
mkdir -p apps/api/applications/app-service/src/main/resources/keys

# Generate private key
openssl genrsa -out apps/api/applications/app-service/src/main/resources/keys/private.pem 2048

# Extract public key
openssl rsa -in apps/api/applications/app-service/src/main/resources/keys/private.pem -pubout -out apps/api/applications/app-service/src/main/resources/keys/public.pem
```

### Step 3: Run the Spring Boot API
From the repository root or `apps/api` directory:

```bash
# From root:
./apps/api/gradlew -p apps/api :app-service:bootRun

# Or within apps/api:
cd apps/api
./gradlew :app-service:bootRun
```

The API will start on `http://localhost:8080/api` with the `dev` profile active.

### Step 4: Run the Angular Web Frontend
In another terminal, install workspace dependencies and start the development server:

```bash
# Install mono-repo dependencies
bun install

# Start Angular dev server
bun run dev:web
```

The web client will be accessible at `http://localhost:4200`.

---

## 3. Development Tools & Endpoints

- **Scalar Interactive API Docs**: `http://localhost:8080/api/scalar`
- **OpenAPI v3 JSON Spec**: `http://localhost:8080/api/v3/api-docs`
- **Actuator Health Check**: `http://localhost:8080/api/actuator/health`
- **Design System Storybook**: `bun run dev:design-system` (available on `http://localhost:6006`)

---

## 4. SQL & Flyway Debugging

In `dev` profile (`application-dev.yaml`):
- Hibernate formatted SQL query logging is enabled (`org.hibernate.SQL: DEBUG`, `org.hibernate.orm.jdbc.bind: TRACE`).
- Flyway schema initialization logs at `DEBUG`.

---

## 5. Troubleshooting

- **Database connection failure**: Check if PostGIS container is healthy with `docker ps` and check logs with `bun run dev:db:logs`.
- **Missing Key Error**: Ensure `keys/public.pem` and `keys/private.pem` exist in `apps/api/applications/app-service/src/main/resources/keys/`.
- **Port Conflicts**: Ensure ports `8080`, `5432`, and `4200` are free on your machine.
