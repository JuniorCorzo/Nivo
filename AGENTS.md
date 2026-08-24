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
