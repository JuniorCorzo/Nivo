<!-- TAG: DELTA-SPEC -->

# Delta Specification: Internal User & Role Management (ANC-49 / ANC-50)

## Purpose

This delta specification defines additions, modifications, and removals across the Nivo Backend (`apps/api`) and Web Application (`apps/web`) to support tenant user listing, staff invitations, role modification, account deactivation, and route-level Role-Based Access Control (RBAC).

---

## Delta: ADDED

### Requirement: Domain Use Case `ListUsersByTenantUseCase`

The backend system SHALL provide a Clean Architecture use case `dev.angelcorzo.nivo.domain.usecase.user.ListUsersByTenantUseCase` that retrieves all users belonging to the currently authenticated tenant.

#### Scenario: Successful Tenant Users Retrieval

- **GIVEN** an authenticated user with role `MANAGER` or `OWNER` belonging to Tenant `T1`
- **WHEN** `ListUsersByTenantUseCase.execute()` is invoked
- **THEN** the use case SHALL retrieve `T1`'s ID via `AuthenticationContextGateway.getCurrentTenantId()`
- **AND** query `UsersRepository.findAllByTenantId(tenantId)`
- **AND** return a list of `Users` domain entities ordered by creation date descending.

#### Scenario: Empty Staff Roster

- **GIVEN** a tenant with no registered users other than the newly created owner
- **WHEN** `ListUsersByTenantUseCase.execute()` is invoked
- **THEN** the use case SHALL return a list containing only the existing user without throwing errors.

---

### Requirement: REST Endpoint `GET /users`

The backend system SHALL expose a REST endpoint `GET /users` in `UserController` restricted to users with managerial privileges.

#### Scenario: Authorized User Listing Request

- **GIVEN** an HTTP `GET /users` request accompanied by a valid JWT for a user with role `MANAGER` or `OWNER`
- **WHEN** the request is processed by `UserController.getUsers()`
- **THEN** the system SHALL return HTTP `200 OK`
- **AND** the response body SHALL contain `Response<List<UserDTO>>` populated with user details and message `"Usuarios obtenidos con éxito"`.

#### Scenario: Unauthorized Access by Operator

- **GIVEN** an HTTP `GET /users` request accompanied by a JWT for a user with role `OPERATOR`
- **WHEN** evaluated against `@PreAuthorize("hasRole('MANAGER')")`
- **THEN** Spring Security SHALL reject the request with HTTP `403 Forbidden`.

---

### Requirement: Client-Side Route Guard `roleGuard`

The web application SHALL provide a functional Angular route guard `roleGuard(allowedRoles: Role[]): CanActivateFn` located at `apps/web/src/app/core/guards/auth/role-guard.ts`.

#### Scenario: Allowed Role Access

- **GIVEN** a route protected by `roleGuard(['OWNER', 'MANAGER'])`
- **WHEN** a user with role `OWNER` or `MANAGER` navigates to the route
- **THEN** the guard SHALL return `true` allowing navigation.

#### Scenario: Denied Role Access and Redirect

- **GIVEN** a route protected by `roleGuard(['OWNER', 'MANAGER'])`
- **WHEN** a user with role `OPERATOR` navigates to the route
- **THEN** the guard SHALL emit an error toast stating `"No tienes permisos para acceder a este módulo"`
- **AND** return a `UrlTree` redirecting to `/app/dashboard`.

#### Scenario: Unauthenticated User Redirection

- **GIVEN** a route protected by `roleGuard`
- **WHEN** an unauthenticated visitor navigates directly to the route URL
- **THEN** the guard SHALL redirect to `/auth/login`.

---

### Requirement: User Management Page (`UsersPageComponent`)

The web application SHALL provide a standalone page component `UsersPageComponent` at `/app/users` displaying tenant staff and administrative actions.

#### Scenario: Page Initialization and Metrics

- **GIVEN** an authorized manager loads `/app/users`
- **WHEN** the component initializes
- **THEN** it SHALL display a header with page title and description
- **AND** display KPI summary cards (Total Usuarios, Operadores Activos, Administradores, Inactivos)
- **AND** trigger `UserService.loadUsers()` to populate the table.

#### Scenario: Real-time Search and Filter

- **GIVEN** the user table loaded with multiple staff members
- **WHEN** the manager types a name or email into the search input or selects a role filter chip
- **THEN** the TanStack table SHALL immediately filter rows matching the criteria without network requests.

---

### Requirement: Modal Dialogs (`InviteUserModal`, `ModifyRoleModal`, `DeactivateUserModal`)

The web application SHALL provide accessible modal dialogs for staff lifecycle operations using `@nivo-sass/design-system`.

#### Scenario: Inviting a New User

- **GIVEN** the `InviteUserModalComponent` is open
- **WHEN** the manager enters valid email, full name, phone number, and selects role `OPERATOR`
- **AND** clicks "Enviar Invitación"
- **THEN** the system SHALL invoke `UserService.inviteUser()`
- **AND** on success, display a success toast, close the modal, and refresh the user list.

#### Scenario: Modifying User Role

- **GIVEN** an active user in the table with role `OPERATOR`
- **WHEN** the manager opens `ModifyRoleModalComponent`, selects `MANAGER`, and confirms
- **THEN** the system SHALL invoke `UserService.modifyRole()`
- **AND** update the user's role badge in the table without full page reload.

#### Scenario: Deactivating a User Account

- **GIVEN** an active operator in the table
- **WHEN** the manager clicks "Desactivar" and confirms the destructive alert
- **THEN** the system SHALL invoke `UserService.deactivateUser()`
- **AND** mark the user's status as `Inactivo` in the roster.

---

## Delta: MODIFIED

### Requirement: `UsersRepository` & `UserRepositoryAdapter`

The domain gateway and infrastructure persistence layer SHALL be extended to query users by tenant ID.

#### Modification:

- Add `List<Users> findAllByTenantId(UUID tenantId)` to `UsersRepository`.
- Add `@Query("SELECT u FROM UsersData u WHERE u.tenant.id = :tenantId ORDER BY u.createdDate DESC")` to `UserRepositoryData`.
- Implement mapping and entity conversion in `UserRepositoryAdapter`.

---

### Requirement: `UserService` Angular Service

The service `apps/web/src/app/core/services/user/user-service.ts` SHALL be modified to manage staff state reactively.

#### Modification:

- Add signals: `users = signal<UserInfoModel[]>([])` and `isLoading = signal<boolean>(false)`.
- Add methods: `loadUsers()`, `inviteUser(dto)`, `modifyRole(userId, role)`, and `deactivateUser(userId)`.

---

### Requirement: Application Sidebar (`SidebarBase`)

The navigation sidebar component `SidebarBase` SHALL be modified to enforce role-based menu filtering.

#### Modification:

- Add a new navigation item for "Usuarios" linking to `/app/users` with icon `lucideUsers`.
- Filter `navItems` based on `userService.currentUser()?.role`, hiding the "Usuarios" menu item for `OPERATOR`, `DRIVER`, and `AUDITOR`.

---

### Requirement: Route Definitions (`app.routes.ts`)

The root application routes SHALL include the new user management page route.

#### Modification:

- Register route `/app/users` lazy loading `UsersPageComponent`.
- Apply `canActivate: [authGuard, roleGuard(['SUPERADMIN', 'OWNER', 'MANAGER'])]`.

---

## Delta: REMOVED

_None. All changes are backward compatible extensions._
