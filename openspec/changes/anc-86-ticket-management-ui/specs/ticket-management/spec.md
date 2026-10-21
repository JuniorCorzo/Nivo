# Ticket Management Specification

## Overview

Defines frontend requirements for ticket history auditing, multi-criteria reactive filtering, detail inspection with live rate preview for active stays, and receipt reprinting within parking lot operations.

## Requirements & Acceptance Scenarios

### Requirement 1: Historical Ticket Listing & Reactive Filtering

The system MUST display a paginated ticket list for a parking lot and reactively filter results by license plate, status (`OPEN`, `CLOSED`), vehicle type, and date range without full page reloads.

#### Scenario 1.1: Reactive filtering by license plate and status

- **Given** an operator viewing the ticket management table
- **When** the operator types a search plate "ABC-123" and selects status "OPEN"
- **Then** the system MUST filter the ticket list to matching records within 300ms debounce
- **And** update the displayed count reactively via signals.

#### Scenario 1.2: Empty state on non-matching criteria

- **Given** an operator applying filter criteria
- **When** no tickets match the combined search parameters
- **Then** the system MUST display an `nv-card` empty state with clear reset actions.

### Requirement 2: Ticket Detail Preview Drawer & Live Rate Calculation

The system MUST provide a slide-over detail drawer displaying ticket metadata, stay duration, and live rate breakdown for `OPEN` tickets via real-time pricing simulation.

#### Scenario 2.1: Live rate calculation for open ticket

- **Given** an open ticket selected from the historical list
- **When** the operator opens the ticket detail drawer
- **Then** the system MUST request rate calculation via `TicketService.calculatePrice`
- **And** display the estimated elapsed duration, subtotal, IVA, and total to charge.

#### Scenario 2.2: Historical detail display for closed ticket

- **Given** a closed ticket selected from the list
- **When** the drawer opens
- **Then** the system MUST display entry time, exit time, recorded payment method, and finalized charge without invoking live rate calculation.

### Requirement 3: Receipt Reprinting Trigger

The system MUST allow operators to reprint entry and exit receipts for any ticket by reusing `TicketReceiptComponent`.

#### Scenario 3.1: Reprint receipt from ticket list or drawer

- **Given** a viewed ticket in the table or detail drawer
- **When** the operator triggers the "Reprint Receipt" action
- **Then** the system MUST open `TicketReceiptComponent` modal populated with the ticket summary and payment record
- **And** invoke the browser print workflow upon operator confirmation.

#### Scenario 3.2: Dismiss receipt preview modal

- **Given** the receipt reprint modal is active
- **When** the operator clicks the close button or presses `Escape`
- **Then** the system MUST dismiss the modal and restore focus to the triggering element.

### Requirement 4: Design System & Accessibility Conformance

All ticket management views MUST strictly utilize `@nivo-sass/design-system` components (`nv-table`, `nv-card`, `nv-badge`, `nv-input`, `nv-select`, `nv-button`, `nv-typography`) and conform to WCAG 2.2 Level AA standards.

#### Scenario 4.1: Design system component compliance

- **Given** any component within the ticket management feature
- **When** rendering UI controls and layouts
- **Then** the template MUST NOT contain raw unstyled HTML buttons or inputs
- **And** MUST employ `ChangeDetectionStrategy.OnPush`.

#### Scenario 4.2: Keyboard navigation and ARIA attributes

- **Given** an operator navigating via keyboard
- **When** tabbing through filters, table rows, and drawer controls
- **Then** interactive elements MUST display visible focus rings
- **And** the drawer MUST trap focus with `role="dialog"` and `aria-modal="true"`.

## Interface & Contract Constraints

- **REST Endpoints**: Consumes `GET /tickets/list?parking=:parkingId` and `GET /rates/calculate?ticketId=:ticketId`.
- **Signal State**: `TicketsFacade` MUST expose `tickets`, `filters`, `selectedTicket`, `liveRatePreview`, and `isLoading` as readonly signals.
