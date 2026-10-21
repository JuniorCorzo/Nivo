# Change Proposal: User Invitations & Team Role Management (RF-011)

## 1. Problem Statement

Parking owners (tenants) need to delegate daily operational duties (check-in/out, rate inspection, auditing) to team members without sharing Owner credentials or compromising multi-tenant isolation. Previous specifications lacked formal criteria for the invitation lifecycle, role mutation, and account activation.

## 2. Proposed Solution

Implement a complete tenant invitation and role administration system:

1. **Secure Email Invitations:** Tenant owners can invite users to their organization with dedicated roles (`MANAGER`, `OPERATOR`, `AUDITOR`).
2. **Time-Limited Token Lifecycle:** Invitations carry cryptographic tokens with 72-hour expiration and state tracking (`PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`).
3. **Role Enforcement:** Prohibit assigning `OWNER` or `SUPERADMIN` via invitations to prevent unauthorized privilege escalation.
4. **Ownership Protection:** Ensure the last remaining `OWNER` in a tenant cannot be deactivated, demoted, or deleted.

## 3. Scope & Impact

- **Backend (`apps/api`):** Use cases `InviteUserWithRolUseCase`, `AcceptInvitationUseCase`, `ModifyUserRoleUseCase`, `DeactivateUserUseCase`.
- **Database:** `user_invitations` table with tenant foreign key, token index, and expiration timestamp.
- **Security:** Token validation, password hashing, and role verification via Spring Security.
