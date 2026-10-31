## Commit Conventions

Conventional Commits via `commit-work` skill. Scopes:

### App scopes

| Scope | When to use                       |
| ----- | --------------------------------- |
| `web` | Angular frontend app (`apps/web`) |
| `api` | Java/Spring backend (`apps/api`)  |

### Library scopes

| Scope           | When to use                                      |
| --------------- | ------------------------------------------------ |
| `design-system` | Angular design system lib (`libs/design-system`) |

### API internal scopes (Clean Architecture)

Inside `apps/api`, prefer layer scopes:

| Scope         | When to use                                  |
| ------------- | -------------------------------------------- |
| `domain`      | Entities, value objects, gateways            |
| `usecase`     | Business use cases                           |
| `adapter`     | Driven adapters / repository implementations |
| `entry-point` | Controllers, listeners, API endpoints        |
| `config`      | App configuration, beans, properties         |

Functional scopes valid when clearer: `auth`, `tenant`, `user`, `security`.

### Scope selection rules

- Cross-cutting (`web` + `api`) → split into separate commits per app scope
- Lib + app → split: commit lib, commit app
- Inside `api` only → prefer layer scopes (`domain`, `usecase`, etc.)
- Inside `web` or `design-system` → use component/feature name as scope

## Skills

| Skill                       | Description                                                                                       | Link                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `nivo-brand-design`         | Brand design system (colors, typography, logo, voice) for Nivo web                                | [SKILL.md](libs/design-system/skills/nivo-brand-design/SKILL.md) |
| `angular-developer`         | Angular architecture, signals reactivity, forms, routing, and testing guidelines                  | [SKILL.md](.agents/skills/angular-developer/SKILL.md)            |
| `nivo-api`                  | Nivo Spring Boot 4, Java 25 Clean Architecture guidelines, coding conventions, and test standards | [SKILL.md](.agents/skills/nivo-api/SKILL.md)                     |
| `angular-testing`           | Modern Angular testing patterns, component fixtures, signals testing                              | [SKILL.md](.agents/skills/angular-testing/SKILL.md)              |
| `vitest`                    | Vitest testing patterns, mocks, snapshots, performance configuration                              | [SKILL.md](.agents/skills/vitest/SKILL.md)                       |
| `playwright-best-practices` | Resilient E2E testing locators, fixtures, isolation, and anti-patterns                            | [SKILL.md](.agents/skills/playwright-best-practices/SKILL.md)    |
| `playwright-cli`            | Playwright CLI integration and browser automation commands                                        | [SKILL.md](.agents/skills/playwright-cli/SKILL.md)               |
| `springboot-tdd`            | Spring Boot TDD with JUnit 5, Mockito, MockMvc, and Testcontainers                                | [SKILL.md](.agents/skills/springboot-tdd/SKILL.md)               |
| `tdd`                       | Strict test-driven development workflow (Red-Green-Refactor)                                      | [SKILL.md](.agents/skills/tdd/SKILL.md)                          |
| `qa-verification-harness`   | Deterministic 5-layer verification harness, agent-browser testing, and code review                 | [SKILL.md](.agents/skills/qa-verification-harness/SKILL.md)      |

Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:

- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: /caveman lite|full|ultra|wenyan
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
