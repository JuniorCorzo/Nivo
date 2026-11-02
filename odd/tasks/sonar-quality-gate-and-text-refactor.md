# Feature: Sonar Quality Gate Remediation & Text Constants Modularization

Orchestration plan to resolve all SonarQube issues across Frontend, Backend, and Infrastructure, and modularize monolithic text/error constants by feature.

## Specs

- S1: Backend: Eliminate `test-websocket.html`, document WebSocket STOMP endpoint in Scalar/OpenAPI and Bruno, enable Gradle dependency locking (`gradle.lockfile` / verification) to solve `text:S8569` and `Web:S6853`.
- S2: Infrastructure: Normalize startup scripts (`dev.sh`, `start-dev.sh`, `stop-dev.sh`) using `[[ ... ]]` conditionals (`shell:S7688`), pin GitHub Actions dependencies to full commit SHAs (`githubactions:S7637`), add `--ignore-scripts` to npm/pnpm workflows (`githubactions:S6505`), and scope permissions to job level (`githubactions:S8233`).
- S3: Backend Constants Refactoring: Modularize monolithic `ErrorMessagesModel.java` into feature-focused domain exception messages per feature domain (`auth`, `parking`, `slot`, `rate`, `ticket`, `tenant`, etc.).
- S4: Frontend Sonar Remediation: Fix Blockers & Criticals (`typescript:S7651` output names, `typescript:S7649` input aliases, `typescript:S2699` test assertions in E2E and dashboard specs, `typescript:S2871` localeCompare in `metrics.service.ts`), Reliability & Security (`typescript:S8786` regexes, `typescript:S9383` unhandled promises, `typescript:S2245` ID generator in input/checkbox, `docker:S6471` non-root nginx Dockerfile), and Accessibility (`Web:InputWithoutLabelCheck`, `Web:S6853`).
- S5: Frontend Text Constants Modularization: Split monolithic `app-texts.constant.ts` (1373 lines) into feature-based text files (`auth.texts.ts`, `dashboard.texts.ts`, `parking.texts.ts`, `operations.texts.ts`, `slots.texts.ts`, `rates.texts.ts`, `tickets.texts.ts`, `navigation.texts.ts`) with clean barrel re-exports preserving zero breaking changes for existing consumers.
- S6: Verification: Execute unit and lint verification on backend (`./gradlew check -x test` or tests) and frontend (`pnpm test` / `pnpm build`), ensuring zero regressions.

## Tasks

- T1: [S1, S2, S3] Backend & Infrastructure Remediation (Worker 1) | route: inline | commit: verified
- T2: [S4, S5] Frontend Remediation & Text Constants Modularization (Worker 2) | route: inline | commit: verified
- T3: [S6] Comprehensive Verification & Sonar Quality Gate Review | route: inline | commit: verified

## Log

- L1: "quiero que entres a sonar cube revisa el proyecto de Nivo y haz una auditoria de los fallos que se encontraron, al final arma un plan de implementacion dividido en backend o frontend, tambien explica el porque de estos fallos"
- L2: "manejemos dos subagentes que implemente cada cosa, en el backend el error de test-websocket, si es posible mediante scalar configurar websockets podemos eliminar esa parte del proyecto, al final el objectivo de eso es poder testear los websockets, en infrastructura normalicemos el script de arranque, y tengo otra tarea aunque no estaba planteada aca creo que encaja perfectamente dentro del frontend y backend existen archivos de verdad unica para el texto, de hechoo las reglas del proyecto prohiben string harcodeadoos en su momento me parecio bien un unicoo archivo, pero el proyecto crecio y se saliooo de la mano ese archivo creo que para este punto lo mejor es separarloo por feature asi tenemos archivos mas centrados y con una sola responsabilidad"
