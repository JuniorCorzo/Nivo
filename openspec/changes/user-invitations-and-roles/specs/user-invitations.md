# Specification: User Invitations & Team Roles (RF-011)

## 1. Context & Business Rules

### Rule 1: Permitted Roles for Invitations

Invitations may only be issued for operational roles:

- `MANAGER`
- `OPERATOR`
- `AUDITOR`

Assigning `OWNER` or `SUPERADMIN` through the invitation flow must be rejected with `InvalidRoleException` (HTTP 400).

### Rule 2: Tenant Membership & Duplicate Protection

If the invited email already belongs to an active user within the tenant, the system must abort with `UserAlreadyExistsInTenantException` (HTTP 409).

### Rule 3: 72-Hour Expiration & Acceptance

- Invitations are initialized in `PENDING` status with `expires_at = now() + 3 days`.
- An invitation can only be accepted if `now() < expires_at` and `status == PENDING`.
- Upon successful password setup, status transitions to `ACCEPTED`, and user record is persisted with the invited role.

### Rule 4: Invariant of Ownership Preservation

A tenant must possess at least one active `OWNER`. Any command that attempts to deactivate or mutate the role of the sole `OWNER` of a tenant must be rejected with HTTP 409/400.

## 2. Gherkin Scenarios

```gherkin
Feature: User Invitations and Role Management

  Scenario: Owner successfully invites an Operator
    Given an authenticated Owner of tenant "T1"
    When the Owner invites "colleague@parking.com" with role "OPERATOR"
    Then an invitation is created with status "PENDING" and expires in 72 hours
    And an invitation email notification is queued

  Scenario: Invitation rejected when email already exists in tenant
    Given an authenticated Owner of tenant "T1"
    And user "colleague@parking.com" is already a member of tenant "T1"
    When the Owner attempts to invite "colleague@parking.com"
    Then the request is rejected with UserAlreadyExistsInTenantException (409)

  Scenario: Invitation rejected when attempting to invite as OWNER
    Given an authenticated Owner of tenant "T1"
    When the Owner attempts to invite "newowner@parking.com" with role "OWNER"
    Then the request is rejected with InvalidRoleException (400)

  Scenario: Invited user accepts valid invitation
    Given an invitation exists with valid token and status "PENDING"
    When the user completes password and personal details
    Then the user is activated in the tenant with the assigned role
    And the invitation status becomes "ACCEPTED"

  Scenario: Preventing deactivation of the last remaining Owner
    Given tenant "T1" has exactly one active user with role "OWNER"
    When a request attempts to deactivate or demote that user
    Then the request is blocked to preserve tenant administrative continuity
```
