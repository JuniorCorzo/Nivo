# AGENTS.md — NeoParking

NeoParking is an Nx monorepo. The main backend lives at `apps/api` (Java/Gradle). All commands below run from the **workspace root** unless noted.

## Monorepo Structure

```
NeoParking/
├── apps/
│   └── api/          # Spring Boot backend (Java 25, Gradle)
├── database/         # Shared DB migrations/scripts
├── docs/             # Project documentation
└── nx.json           # Nx workspace config (Gradle plugin)
```

## Global Commands

```bash
# Build all projects via Nx
./nx build api

# Run all tests
./nx test api

# Run single test class (from apps/api/)
./gradlew test --tests "dev.angelcorzo.neoparking.SomeTestClass"

# Run single test method
./gradlew test --tests "dev.angelcorzo.neoparking.SomeTestClass.someMethod"

# Run tests in a specific Gradle module
./gradlew :domain:usecase:test

# Stop on first failure
./gradlew test --fail-fast
```

## Agent Rules (Always Active)

- NEVER add "Co-Authored-By" or AI attribution to commits.
- Use Conventional Commits format: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`.
- Never build after making changes unless explicitly asked.
- When a question requires verification, investigate before answering.
- Never assume — stop and ask if context is missing.

## Specialized Agents

Load the agent file for domain-specific work:

| Task | Agent |
|------|-------|
| Scaffold models/use-cases/adapters/entry-points | `apps/api/.github/agents/bancolombia-scaffold.agent.md` |
| SOLID refactoring and design review | `apps/api/.github/agents/solid.agent.md` |

## App-Specific Guidelines

For `apps/api` code style, architecture rules, and Java conventions, see:

```
apps/api/.github/skills/neoparking-api.skill.md
```
