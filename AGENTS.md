<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

## Commit Conventions

Uses Conventional Commits via the `commit-work` skill. When committing in this workspace, use these Nx-aware scopes:

### App scopes

| Scope | When to use |
|-------|-------------|
| `web` | Angular frontend app (`apps/web`) |
| `api` | Java/Spring backend (`apps/api`) |

### Library scopes

| Scope | When to use |
|-------|-------------|
| `design-system` | Angular design system lib (`libs/design-system`) |

### API internal scopes (Clean Architecture)

When working exclusively inside `apps/api`, prefer these layer scopes:

| Scope | When to use |
|-------|-------------|
| `domain` | Entities, value objects, gateways |
| `usecase` | Business use cases |
| `adapter` | Driven adapters / repository implementations |
| `entry-point` | Controllers, listeners, API endpoints |
| `config` | App configuration, beans, properties |

For the API, also consider functional scopes when clearer: `auth`, `tenant`, `user`, `security`.

### Scope selection rules

- Cross-cutting change (web + api) → split into separate commits per app scope
- Lib + app change → split: one commit for the lib, one for the app
- Within api only → prefer layer scopes (`domain`, `usecase`, etc.)
- Within web or design-system → use component/feature name as scope

## Skills

| Skill | Description | Link |
|-------|-------------|------|
| `nivo-brand-design` | Brand design system (colors, typography, logo, voice) for Nivo web | [SKILL.md](libs/design-system/skills/nivo-brand-design/SKILL.md) |
