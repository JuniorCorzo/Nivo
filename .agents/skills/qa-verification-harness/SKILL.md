---
name: qa-verification-harness
description: "Trigger: QA, code review, verify implementation, audit evidence, quality gates, agent browser QA, tool discovery. Deterministic 5-layer verification harness with agent browser smoke testing, concurrent batch test execution, automated code review, and on-demand tool reinforcement discovery."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.1"
---

## Activation Contract

Activate when:
- Implementation or bugfix units finish and require verification before merge or closure.
- User or orchestrator requests QA verification, evidence audit, code review, or quality gate checks.
- Web UI modifications require live runtime validation with `agent-browser`.
- Parallel subagent units complete and require unified convergence verification.
- User requests discovery or auditing of code review tools to reinforce the QA harness (e.g. `/qa-verification-harness --discover-tools`, "busca tools para el arnes", "reforzar arnes con code review tools").

Do not activate when:
- Implementation is actively underway mid-unit.
- Scoping, drafting specs, or planning architecture before code exists.

## Hard Rules

- **Evidence over assumption:** Never declare tasks complete or ready for merge without executed terminal commands returning exit code 0 with reproducible logs.
- **Zero debug residue:** Zero `console.log`, `System.out.println`, `print()`, `debugger`, test flags, or commented-out code in diff.
- **Scope containment:** Edit only files required for the task. Never reformat or refactor unrelated files.
- **Dependency hygiene:** Never add dependencies unless explicitly instructed. Never loosen linters or suppress types (`any`, `@ts-ignore`).
- **Post-implementation timing:** Run QA verification at the end of all implementation units, never interrupting coding mid-flight.
- **Parallel subagent support:** Orchestrator may dispatch concurrent subagents on disjoint edit surfaces; run unified QA convergence when all finish.
- **Batch test execution (Gate L3 optimization):** For monorepos or multi-service projects, independent test suites may run concurrently in batches (capped at 2-3 parallel jobs to respect system resources). All batch jobs must return exit code 0. If any suite fails, isolate its failure trace without blocking reporting.
- **Tool discovery and permission protocol:** If a required tool is missing, investigate standard ecosystem tooling and send a message to parent orchestrator with tool name, rationale, and install command. Never autonomously install packages or run package managers.
- **Human confirmation for tool reinforcement:** When running in Code Review Tool Discovery Mode, generate recommendations but explicitly require human confirmation before installing any tool or modifying repository manifests.
- **Agent browser QA & UI/UX Auditing:** For web UI changes, use `agent-browser` MCP tools to navigate the live application, verify DOM rendering, assert zero `console.error`, and enforce Human-Grade UI/UX Auditing heuristics.
- **RDD traceability:** For bugfixes, capture failing proof (Red), apply fix, and capture passing proof (Green). For features, enforce automated test coverage on all new execution paths.
- **Two-axis review:** Audit diff for Technical Correctness (nullability, edge cases, error handling) and Architectural Compliance (layer boundaries, clean architecture).

## Decision Gates

| Layer | Node / TypeScript | Java / Spring Boot | Python | Go | Rust |
|---|---|---|---|---|---|
| **L0: Types & Comp** | `tsc --noEmit` / `pnpm build` | `./gradlew compileJava` | `mypy` / `pyright` | `go build ./...` | `cargo check` |
| **L1: Lint & Style** | `biome check` / `eslint` | `./gradlew checkstyleMain` | `ruff check` | `golangci-lint run` | `cargo clippy` |
| **L2: Security & Git** | `gitleaks protect --staged` && `git diff --check` | `gitleaks protect --staged` && `git diff --check` | `gitleaks protect --staged` && `git diff --check` | `gitleaks protect --staged` && `git diff --check` | `gitleaks protect --staged` && `git diff --check` |
| **L3: Automated Tests**| `pnpm test` / `vitest run` | `./gradlew test` | `pytest` | `go test ./...` | `cargo test` |
| **L4: Runtime / Smoke** | `agent-browser` / HTTP check | App boot + health check | App boot + health check | App boot + health check | App boot + health check |

### Batch Test Execution Protocol (Gate L3 Optimization)

For monorepos or multi-service projects with independent test suites (e.g. backend unit tests, frontend unit tests, design system tests):
1. **Concurrency Cap:** Limit concurrent execution to 2-3 parallel background tasks or subshells to prevent CPU/memory exhaustion.
2. **Output Aggregation:** Capture and aggregate stdout/stderr for each concurrent suite.
3. **Exit Code Verification:** Ensure every suite in the batch exits with `exit code 0`.
4. **Failure Isolation:** If any suite in the batch fails, capture and isolate its exact failure trace and error log without aborting the reporting of other suites.

### Code Review Tool Discovery Gate (On-Demand Mode)

When invoked with discovery triggers (e.g. `--discover-tools`):
1. **Manifest Scan:** Inspect project build files (`package.json`, `build.gradle`, `pom.xml`, `pyproject.toml`, `Cargo.toml`, `go.mod`).
2. **Ecosystem Tool Comparison:** Audit installed tooling against industry-standard static analysis, linting, architecture enforcement, and secret scanning:
   - *Static Analysis & Bug Detection:* SpotBugs, PMD, SonarQube Scanner.
   - *Next-Gen Linters / Formatters:* Oxlint / Ultracite, Biome, Ruff.
   - *Architecture & Layer Enforcement:* ArchUnit (Java), Dependency-Cruiser (JS/TS).
   - *Dead Code & Dependency Hygiene:* Knip (JS/TS), ts-prune, cargo-udeps.
   - *Security & Secret Scanning:* Gitleaks, Trivy, Snyk CLI.
3. **Structured Matrix Emission:** Emit a **Tool Reinforcement Recommendation Matrix** detailing Category, Tool, Purpose, Quality Gate Layer, Install Command, and Non-destructive Execution Command.
4. **Mandatory Human Confirmation:** Require explicit user confirmation before installing any tool or modifying project configurations.

### Missing Tool Escalation Gate

| Scenario | Mandatory Action |
|---|---|
| CLI tool missing | Identify ecosystem standard tool. Send message to parent orchestrator with tool name, purpose, and command. Await explicit approval. |
| Tool requires elevated privileges | Escalate to orchestrator. Never use `sudo` or modify system binaries. |
| UI testing with dev server stopped | Verify if background server is active; if not, request launch from orchestrator before invoking `agent-browser`. |

## Execution Steps

1. **Diff Audit & Hygiene:**
   - Execute `git status --short` and `git diff --stat`. Confirm only in-scope files changed.
   - Run `git diff` inspection. Eliminate any `console.log`, debug statements, or commented code.
2. **Gate L0 (Syntax & Types):**
   - Run ecosystem compiler / type checker. Assert `exit code 0`. Fix any compilation errors.
3. **Gate L1 (Static Analysis & Style):**
   - Execute project linter and formatter check. Assert `exit code 0`. Correct violations without suppressing rules.
4. **Gate L2 (Security & Git Hygiene):**
   - Run `git diff --check` for whitespace or conflict markers.
   - Run secret scanner (`gitleaks protect --staged` or manual credential audit). Ensure zero leaked keys.
5. **Gate L3 (Automated Tests & Batch Execution):**
   - For bugfixes: verify failing proof artifact (Red), then run test suite ensuring passing proof (Green).
   - **Single Suite:** Run unit and integration tests. Assert `exit code 0`.
   - **Batch Execution (Monorepos / Multi-service):**
     * Identify independent test suites (e.g. `api:test`, `web:test`, `design-system:test`).
     * Launch suites concurrently in batches up to 2-3 parallel jobs (e.g. background tasks or parallel shell runners).
     * Collect and aggregate logs from all batch jobs.
     * Assert `exit code 0` for all suites.
     * If any suite fails, isolate its failure trace for the final report.
   - Verify zero regressions in adjacent suites.
6. **Gate L4 (Runtime Smoke & Human-Grade UI/UX Auditing):**
   - For backend/APIs: verify service bootstrap and health endpoints.
   - For Web UIs:
     a. Launch target URL with `agent_browser_open`.
     b. Wait for completion with `agent_browser_wait_for_load` or `agent_browser_wait_for_selector`.
     c. Inspect DOM state via `agent_browser_snapshot`.
     d. Validate expected rendered components and interaction flows.
     e. Check console logs; verify 0 `console.error` entries.
     f. **Human Visual Inspection Checklist:**
        - **Layout & Overflow:** Assert no horizontal page overflow (`scrollWidth > clientWidth`). Verify badges, pills, and action chips do not wrap awkwardly into two lines. Verify modal bodies do not clip submit buttons or header titles.
        - **Visual Contrast & Theming:** Verify WCAG AA readability for secondary/muted text (`text-muted-foreground`) in both light and dark themes. Ensure borders (`border-border`) and cards (`bg-card`) maintain visual separation without muddy contrast.
        - **Spacing, Baseline & Alignment:** Check icon baseline alignment with adjacent typography (no drooping or elevated icons). Ensure symmetric card paddings and consistent grid gaps.
        - **Affordances & Micro-interactions:** Every clickable card, row, or option button MUST have visual cursor feedback (`cursor-pointer`), hover highlight (`hover:bg-accent`), and focus-visible ring. Form submission must trigger a visible loading spinner (`animate-spin`) and disable duplicate clicks.
        - **Content Polish & Interpolation:** Assert zero `[object Object]` strings, zero raw NaN or unformatted decimals (e.g. `12.33333333`), and zero text truncation cutting words mid-sentence unless explicitly designed with tooltip.
     g. **Automated Browser Evaluation (`agent_browser_eval`):**
        Execute the following deterministic evaluation snippet:
        ```javascript
        () => {
          const issues = [];
          // 1. Horizontal overflow
          if (document.documentElement.scrollWidth > window.innerWidth + 2) {
            issues.push(`Horizontal overflow detected: scrollWidth=${document.documentElement.scrollWidth} vs innerWidth=${window.innerWidth}`);
          }
          // 2. Broken images
          const brokenImgs = Array.from(document.querySelectorAll('img')).filter(img => !img.complete || img.naturalWidth === 0);
          if (brokenImgs.length > 0) {
            issues.push(`${brokenImgs.length} broken image(s) found`);
          }
          // 3. [object Object] in text content
          if (document.body.innerText.includes('[object Object]')) {
            issues.push('Uninterpolated "[object Object]" found in DOM text');
          }
          // 4. Missing cursor pointer on clickable cards/buttons
          const clickables = Array.from(document.querySelectorAll('button, [role="button"]'));
          const missingPointer = clickables.filter(el => {
            const style = window.getComputedStyle(el);
            return !el.disabled && style.cursor !== 'pointer' && !style.cursor.includes('pointer');
          });
          if (missingPointer.length > 0) {
            issues.push(`${missingPointer.length} clickable element(s) missing cursor:pointer`);
          }
          return issues;
        }
        ```
        Assert returned issues list is empty (`[]`).
7. **On-Demand Code Review Tool Discovery (When Triggered):**
   - Step 1: Scan repository manifests (`package.json`, Gradle, Maven, Python configs, etc.).
   - Step 2: Compare against ecosystem standards (SpotBugs, ArchUnit, PMD, Oxlint/Ultracite, Knip, Dependency-Cruiser, Gitleaks, Trivy).
   - Step 3: Emit structured **Tool Reinforcement Recommendation Matrix**.
   - Step 4: Halt and request human confirmation before executing any install or modification command.
8. **Two-Axis Review:**
   - Technical: verify error propagation, boundary conditions, edge cases, type safety.
   - Architectural: verify layer isolation, dependency directions, repository conventions.
9. **Convergence Report:** Emit final verification report in the exact required markdown format.

## Output Contract

### Standard QA Verification Report

Emit the following audit block upon standard QA completion:

```markdown
### 📋 Reporte de Verificación del Arnés de QA

1. **Estado del Problema / Causa Raíz:**
   - [Breve explicación concisa de qué fallaba o qué funcionalidad se añadió]

2. **Evidencia Determinista:**
   - **Prueba de reproducción (Failing Proof):** [Nombre del test / Comando / Log que fallaba]
   - **Prueba de validación (Passing Proof):** [Nombre del test / Comando con exit code 0]
   - **Ejecución Batch (si aplica):** [Suites ejecutadas concurrentemente y status exit code 0]

3. **Matriz de Compuertas Superadas:**
   - [x] L0 Compilación / Tipos (`exit code 0`)
   - [x] L1 Linter y Formato (`exit code 0`)
   - [x] L2 Escaneo de Secretos e Higiene Git (`gitleaks` / `git diff --check`)
   - [x] L3 Batería de Pruebas Unitarias / Integración (`exit code 0`)
   - [x] L4 Smoke Test / Runtime (Verificado con agent-browser si aplica UI)
   - **UI/UX Human Heuristics:** [PASS / Issues found]

4. **Archivos Afectados (`git status --short`):**
   - `M ruta/al/archivo.ext`
   - `A ruta/al/test.spec.ext`

**DECISIÓN: CONVERGENCIA ALCANZADA (Listo para revisión / commit)**
```

### On-Demand Tool Reinforcement Recommendation Matrix

Emit the following matrix when tool discovery mode is triggered:

```markdown
### 🛠️ Matriz de Recomendación de Refuerzo de Herramientas de Code Review

| Categoría | Herramienta | Propósito | Capa (Gate) | Comando de Instalación | Comando de Ejecución (No Destructivo) |
|---|---|---|---|---|---|
| Arquitectura | ArchUnit | Validar reglas arquitectónicas y dependencias de capas en Java | L3 | [dependencia test en build.gradle/pom.xml] | `./gradlew test --tests "*ArchitectureTest*"` |
| Análisis Estático | Oxlint / Ultracite | Detección ultra rápida de bugs y code smells en TypeScript | L1 | `pnpm add -D oxlint` | `pnpm oxlint` |
| Higiene de Código | Knip | Detección de archivos no usados, dependencias y exports muertos | L1 | `pnpm add -D knip` | `pnpm knip` |
| Secretos | Gitleaks | Detección de API keys, tokens y credenciales en git staging | L2 | Pre-commit / binario standalone | `gitleaks protect --staged` |
| Dependencias | Dependency-Cruiser | Validar límites de módulos y dependencias cíclicas en TypeScript | L1 | `pnpm add -D dependency-cruiser` | `pnpm depcruise --config .dependency-cruiser.js src` |
| Vulnerabilidades | Trivy | Escaneo de vulnerabilidades en dependencias y contenedores | L2 | `curl -sfL ...` / Homebrew / apt | `trivy fs --severity HIGH,CRITICAL .` |

> [!IMPORTANT]
> Se requiere confirmación humana explícita antes de ejecutar comandos de instalación o modificar archivos de configuración.
```

## References

- [Engineering QA Harness Protocol](/home/juniorcorzo/.gemini/rules/engineering-qa-harness.md)
