## Commit Conventions

Uses Conventional Commits via the `commit-work` skill. When committing in this workspace, use these scopes:

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
