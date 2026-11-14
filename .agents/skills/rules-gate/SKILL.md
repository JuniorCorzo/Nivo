---
name: rules-gate
description: "Trigger: rules, read rules, project rules, agent rules, check rules, enforce rules, mandatory rules, leer rules, .agents/rules. Mandatory gate enforcing agents to inspect, read, and strictly comply with architectural and engineering rules inside .agents/rules/ before implementing any task."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Mandatory gate: Every agent and subagent MUST activate this skill before starting any implementation, bugfix, refactoring, or architectural task in this repository.

Activate when:
- Starting any task involving code changes, tests, architecture, or documentation.
- User or orchestrator invokes "rules", "leer rules", "revisar rules", "mandatory rules", "project rules", or references `.agents/rules/`.
- Delegating work to a subagent or worker.
- Verifying code compliance during code review or QA verification.

Do not skip under any circumstance, including "small fixes" or "urgent changes".

## Hard Rules

- **Zero-Bypass Mandate:** Writing code, tests, or configuration without first reading the applicable rule files in `.agents/rules/` is an immediate protocol violation.
- **Pre-Implementation Reading:** The agent MUST invoke the `read` tool on the relevant `.agents/rules/*.md` files during the exploration/planning phase, BEFORE editing or creating files.
- **Authoritative Hierarchy:** Rules in `.agents/rules/` override generic LLM training, generic style guides, and baseline framework templates.
- **Domain-Specific Mandatory Bindings:**
  - **Angular / Web (`apps/web` or `libs/design-system`):** MUST read `.agents/rules/frontend-angular.md`, `.agents/rules/angular-component-audit.md`, and `.agents/rules/core-principles.md`.
  - **Design System Mandate:** Raw HTML buttons (`<button>`) and inputs (`<input>`) are strictly forbidden when `@nivo-sass/design-system` equivalents (`nv-button`, `nv-input`, `nv-card`, etc.) exist.
  - **Spring Boot / Java (`apps/api`):** MUST read `.agents/rules/backend-java.md` and `.agents/rules/core-principles.md`. Enforce Clean Architecture layer isolation.
  - **Multi-Tenant / Facility Logic:** MUST read `.agents/rules/multi-facility-tenant.md`. Enforce strict tenant and facility isolation.
  - **Testing & TDD:** MUST read `.agents/rules/testing-rigor.md`. Enforce Red-Green-Refactor, zero test skipping, and deterministic execution.
  - **Observability & Logging:** MUST read `.agents/rules/observability-infra.md`. Zero debug residue (`console.log`, `System.out.println`).
  - **Documentation:** MUST read `.agents/rules/documentation-standards.md`.
- **Pre-Completion Audit:** Before declaring any task finished, the agent must verify the diff against each rule of the loaded rule files.

## Decision Gates

| Target Domain / Edit Surface | Mandatory Rules to Read in `.agents/rules/` | Key Invariants Enforced |
|---|---|---|
| **Frontend / Angular (`apps/web`)** | `frontend-angular.md`<br>`angular-component-audit.md`<br>`core-principles.md` | Signals reactivity (`input()`, `computed()`), OnPush, zero raw buttons/inputs, Lucide icons only (no emojis), <100 line page templates. |
| **Design System (`libs/design-system`)** | `frontend-angular.md`<br>`core-principles.md` | Token adherence, ARIA accessibility, isolated component styling, storybook coverage. |
| **Backend / Java API (`apps/api`)** | `backend-java.md`<br>`core-principles.md`<br>`multi-facility-tenant.md` | Clean Architecture (Domain -> Usecase -> Adapter -> Entrypoint), records for DTOs, zero Lombok, explicit transactions. |
| **Testing / QA (Any app/lib)** | `testing-rigor.md`<br>`core-principles.md` | Strict TDD (Red -> Green -> Refactor), deterministic fixtures, 5-layer QA verification gate, zero flaky assertions. |
| **Infra / Observability / Logging** | `observability-infra.md` | Structured logging (MDC, traceId), Prometheus metrics, health probes, zero plain print statements. |
| **Multi-Tenant / Parking Lots** | `multi-facility-tenant.md` | Tenant ID propagation, multi-facility scoping, zero cross-tenant data leaks. |

## Execution Steps

1. **Identify Edit Scope:** Determine which domains are touched by the task (Frontend, Backend, Design System, Multi-Tenant, Tests).
2. **Read Mandatory Rules:** Call `read` tool for every rule file mandated by the Decision Gate table above.
3. **Extract Constraints:** Note explicit MUST / FORBIDDEN constraints (e.g., design system components, OnPush, signals, clean architecture boundaries).
4. **Execute with Rule Compliance:** Implement solution adhering strictly to extracted constraints.
5. **Verify Compliance:** Audit modified files against the rules before executing tests or committing.

## Output Contract

When acknowledging or completing a task under this skill, report:
- **Rules Inspected:** List of `.agents/rules/*.md` files read.
- **Constraints Applied:** Specific architectural rules satisfied (e.g., "Design System nv-button applied", "OnPush enforced", "Clean Architecture boundary respected").
- **Verification Status:** Confirmation that diff passes all rule gates.

## References

- `.agents/rules/core-principles.md` — Core SOLID and architectural principles.
- `.agents/rules/frontend-angular.md` — Angular signals, OnPush, and Design System mandates.
- `.agents/rules/angular-component-audit.md` — Checklist for Angular component health.
- `.agents/rules/backend-java.md` — Java 25 & Spring Boot Clean Architecture standards.
- `.agents/rules/multi-facility-tenant.md` — Multi-tenant and parking lot isolation rules.
- `.agents/rules/testing-rigor.md` — Strict TDD, test standards, and verification layers.
- `.agents/rules/observability-infra.md` — Logging, metrics, tracing, and health standards.
- `.agents/rules/documentation-standards.md` — Documentation and cognitive design guidelines.
