# Proposal: Internal User & Role Management (ANC-49 / ANC-50)

## Metadata
- **Status**: Approved
- **Date**: 2026-10-16
- **Workflow Mode**: `WORKFLOW_MODE: TEAMWORK`
- **Workflow Routing**: `/teamwork`
- **Target Applications**: `apps/api`, `apps/web`
- **Tracking Issues**: ANC-49 (API User Listing & RBAC Policy), ANC-50 (Web User & Role Management UI)

---

## Motivation & Problem Statement

In multi-tenant parking operations, managing staff access, onboarding operators and shift managers, modifying privileges, and enforcing role-based boundaries are fundamental requirements for organizational governance, operational security, and fraud prevention.

Currently, the Nivo platform exhibits critical gaps between backend capabilities and frontend user experience:
1. **Missing Backend Query Pipeline**: Although write operations exist (`POST /users/invite-user`, `PATCH /users/modify-rol`, `DELETE /users/deactivate-user`), there is no query endpoint (`GET /users`) or use case to retrieve all active/inactive users belonging to the authenticated tenant.
2. **Missing Administrative Web Interface**: Tenant managers and owners have no centralized interface in `apps/web` to view their operational staff, inspect assigned roles, send email invitations, update user roles, or deactivate users.
3. **Incomplete Client-Side RBAC Enforcement**: Operators currently have visibility into navigation routes that should be restricted to administrative roles (`MANAGER`, `OWNER`, `SUPERADMIN`). Furthermore, there is no route-level `RoleGuard` in `apps/web` to prevent unauthorized direct URL navigation by operators to managerial views.
4. **Auditability & Operational Ergonomics**: Without a structured user management table, tenant administrators cannot audit staff assignments or review invitation statuses, increasing operational friction and reliance on engineering support.

---

## User Value

- **Robust Operational Governance**: Enforces clear privilege separation between operators (focused on check-in/check-out and ticket management) and managers/owners (managing rates, slots, operational metrics, and personnel).
- **Autonomous Staff Administration**: Managers and owners can independently onboard operators, reassign roles, and immediately revoke system access without engineering intervention.
- **Defensive Route & UI Security**: Route-level protection (`RoleGuard`) and conditional sidebar filtering prevent unauthorized exposure of administrative pages.
- **Enterprise-Grade UI Experience**: Fast, responsive staff management powered by TanStack Table with instant searching, role filtering, accessible modals, and real-time status updates using `@nivo-sass/design-system` tokens.

---

## Scope Boundaries

### In Scope
1. **Backend Query Pipeline (`apps/api`)**:
   - `ListUsersByTenantUseCase`: Clean Architecture domain use case retrieving tenant staff.
   - `UsersRepository.findAllByTenantId(UUID tenantId)`: Port gateway extension.
   - `UserRepositoryAdapter` & `UserRepositoryData`: Driven JPA adapter query with eager tenant mapping.
   - `UserController.getUsers()`: Entrypoint endpoint protected by `@PreAuthorize("hasRole('MANAGER')")` returning `Response<List<UserDTO>>`.
   - Comprehensive unit and integration test coverage (`ListUsersByTenantUseCaseTest`, `UserControllerTest`).
2. **Frontend Security & State Layer (`apps/web`)**:
   - `roleGuard`: Reusable functional `CanActivateFn` checking current user role against allowed roles.
   - `UserService` extensions: Methods for listing tenant users (`getUsers()`), reactive state signals, and delegation to API endpoints.
   - Sidebar conditional rendering: Filter navigation links in `SidebarBase` so the "Usuarios" navigation item only appears for authorized roles (`OWNER`, `MANAGER`, `SUPERADMIN`).
3. **Frontend Management UI (`apps/web/src/app/features/users/`)**:
   - `UsersPageComponent`: Main view with header actions, statistics/counters, search and role filter bars, and TanStack Table integration.
   - `UsersTableComponent` & column definitions: Full Name with Avatar, Email & Contact, Role Badge, Status Badge (Active/Deactivated), Registration Date, and Contextual Action Menu.
   - `InviteUserModalComponent`: Accessible dialog with form controls for email, full name, phone number, and role selection (`OPERATOR`, `MANAGER`).
   - Role modification and user deactivation confirmation dialogs with feedback toasts via `ToastService`.
4. **App Routing & Constants**:
   - Register `/app/users` with `authGuard` and `roleGuard(['OWNER', 'MANAGER', 'SUPERADMIN'])`.
   - Update `app-routes.constant.ts` and `app-texts.constant.ts` with Spanish UI copy.

### Out of Scope
- Global multi-tenant onboarding or tenant profile mutations (handled in tenant settings).
- Dynamic custom permissions/ACL builder (roles remain strictly defined by the system enum: `SUPERADMIN`, `OWNER`, `MANAGER`, `OPERATOR`, `DRIVER`, `AUDITOR`).
- Self-registration workflows outside invitation links (already covered by invitation token validation).
- Password reset and email SMTP gateway revisions (existing notification/email adapters are leveraged).
