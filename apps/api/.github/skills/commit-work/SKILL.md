---
name: commit-work
description: "Create high-quality git commits: review/stage intended changes, split into logical commits, and write clear commit messages (including Conventional Commits). Use when the user asks to commit, craft a commit message, stage changes, or split work into multiple commits."
---

# Commit work

## Goal

Make commits that are easy to review and safe to ship:

- only intended changes are included
- commits are logically scoped (split when needed)
- commit messages describe what changed and why

## Project conventions (required)

Use Conventional Commits with this structure:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

Rules:

- `type(scope): subject` is mandatory.
- Keep subject imperative and concise (target: <= 50 chars).
- Body is strongly recommended and should explain **what/why**.
- For this repository, prefer body sections:
  1.  `CONTEXT:`
  2.  `CHANGES MADE:`
  3.  `IMPACT:`
- Use `BREAKING CHANGE:` in footer when compatibility is broken.

## Recommended types

- `feat`: new behavior/functionality
- `fix`: bug fix
- `refactor`: code structure change without behavior change
- `docs`: documentation only
- `test`: tests only
- `chore`: maintenance/config without product behavior change
- `build`: dependency/build system updates

## Recommended scopes for this architecture

Layer-based scopes:

- `domain`: entities, value objects, gateways
- `usecase`: business use cases
- `adapter`: driven adapters/repository implementations
- `entry-point`: controllers, listeners, API endpoints
- `config`: app configuration/beans/properties
- `helper`: infra utilities

Functional scopes (when clearer than layer-only):

- `auth`, `tenant`, `user`, `api`, `db`, `security`

Prefer the most specific scope that still matches the changed files.

## Inputs to ask for (if missing)

- Single commit or multiple commits? (If unsure: default to multiple small commits when there are unrelated changes.)
- Commit style: Conventional Commits are required.
- Any rules: max subject length, required scopes.

## Workflow (checklist)

1. Inspect the working tree before staging
   - `git status`
   - `git diff` (unstaged)
   - If many changes: `git diff --stat`
2. Decide commit boundaries (split if needed)
   - Split by: feature vs refactor, backend vs frontend, formatting vs logic, tests vs prod code, dependency bumps vs behavior changes.
   - If changes are mixed in one file, plan to use patch staging.
3. Stage only what belongs in the next commit
   - Prefer patch staging for mixed changes: `git add -p`
   - To unstage a hunk/file: `git restore --staged -p` or `git restore --staged <path>`
4. Review what will actually be committed
   - `git diff --cached`
   - Sanity checks:
     - no secrets or tokens
     - no accidental debug logging
     - no unrelated formatting churn
5. Describe the staged change in 1-2 sentences (before writing the message)
   - "What changed?" + "Why?"
   - If you cannot describe it cleanly, the commit is probably too big or mixed; go back to step 2.
6. Write the commit message
   - Use Conventional Commits (required):
     - `type(scope): short summary`
     - blank line
     - body (what/why, not implementation diary)
     - For this repo, prefer:
       - `1. CONTEXT:`
       - `2. CHANGES MADE:`
       - `3. IMPACT:`
     - footer (BREAKING CHANGE) if needed
   - Prefer an editor for multi-line messages: `git commit -v`
   - Use `references/commit-message-template.md` if helpful.
7. Run the smallest relevant verification
   - Run the repo's fastest meaningful check (unit tests, lint, or build) before moving on.
8. Repeat for the next commit until the working tree is clean

## Deliverable

Provide:

- the final commit message(s)
- a short summary per commit (what/why)
- the commands used to stage/review (at minimum: `git diff --cached`, plus any tests run)

## Commit boundary strategy

Prefer **atomic commits** (one logical change per commit).

Good:

```text
feat(domain): add User entity
feat(usecase): add CreateUserUseCase
feat(adapter): implement UserRepositoryAdapter
feat(entry-point): add UserController
```

Avoid:

```text
feat: add complete user management feature
```

For full features, prefer this order when possible:

1. `feat(domain)`
2. `feat(usecase)`
3. `feat(adapter)`
4. `feat(entry-point)`
5. `test(usecase)` / `test(adapter)`
6. `docs(api)`
7. `chore(config)`

## Message templates

### General template

```text
<type>(<scope>): <subject>

<one-line summary>

1. CONTEXT:
   - Why this change is needed.

2. CHANGES MADE:
   - Main modifications.

3. IMPACT:
   - Runtime/dev/product impact.

[optional]
BREAKING CHANGE: <details>
```

### Docs-focused commit template

```text
docs(<scope>): add JavaDocs for <component>

Document contracts and behavior for maintainability.

1. CONTEXT:
   - Interface/class lacked clear contract documentation.

2. CHANGES MADE:
   - Added class-level JavaDoc and method-level tags (`@param`, `@return`, `@throws`).

3. IMPACT:
   - Clearer implementation contract and easier onboarding.
```

## JavaDoc expectations (when docs are in scope)

When adding docs for domain/usecase/adapter/public APIs, prefer:

- Class-level purpose and architectural role.
- Method contract: inputs, output, side effects, and failure modes.
- `@param`, `@return`, `@throws` for public methods.
- `@see` links where relationships are important.
- Keep behavior statements accurate; avoid vague comments.

## Quick quality checks before commit

- No secrets, API keys, or credentials.
- No debug logs or temporary TODOs unrelated to scope.
- No unrelated formatting churn.
- Staged diff matches commit message scope.
