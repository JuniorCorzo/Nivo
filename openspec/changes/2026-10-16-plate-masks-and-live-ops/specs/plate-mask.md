<!-- TAG: DELTA-SPEC -->

# Delta Specification: Colombian & Venezuelan Plate Masks + Live Operations

## Purpose

This delta specification defines additions, modifications, and removals across the Nivo Web application (`apps/web`) and operational prototypes to support automated license plate masking for Colombian and Venezuelan vehicles, caret-preserving input formatting, and an interactive Impeccable live operations simulation.

---

## Delta: ADDED

### Requirement: Standalone `PlateMaskDirective`

The system SHALL provide an Angular standalone directive `[appPlateMask]` in `apps/web/src/app/shared/directives/plate-mask.ts` that enforces real-time formatting on HTML input elements based on country and vehicle type.

#### Scenario: Colombian Car Plate Input (`AAA-000`)

- **GIVEN** `country` is `'CO'` and `vehicleType` is `'CAR'`
- **WHEN** the user types `abc123`
- **THEN** the directive SHALL format the input value to `ABC-123`, capping the raw alphanumeric input at 6 characters.

#### Scenario: Colombian Motorcycle Plate Input (`AAA-00A`)

- **GIVEN** `country` is `'CO'` and `vehicleType` is `'MOTORCYCLE'`
- **WHEN** the user types `abc12d`
- **THEN** the directive SHALL format the input value to `ABC-12D`, where characters 4-5 are digits and character 6 is an uppercase letter.

#### Scenario: Venezuelan Vehicle Plate Input (`AA-000-AA`)

- **GIVEN** `country` is `'VE'`
- **WHEN** the user types `ab123cd`
- **THEN** the directive SHALL format the input value to `AB-123-CD`, capping the raw alphanumeric input at 7 characters (2 letters, 3 digits, 2 letters).

#### Scenario: Input Sanitization and Uppercasing

- **GIVEN** the user inputs arbitrary characters including spaces, special characters, or lowercase letters (e.g. `a.b-c 1@2#3`)
- **WHEN** the input event fires
- **THEN** the directive SHALL strip all non-alphanumeric characters, convert letters to uppercase, and apply the designated country mask.

#### Scenario: Caret Position Preservation

- **GIVEN** an input containing formatted text `ABC-123` with the cursor placed between `1` and `2`
- **WHEN** the user types `9` (resulting in an edit within the middle of the string)
- **THEN** the directive SHALL recalculate the masked string and restore the cursor immediately after the newly typed character rather than jumping to the end of the input.

#### Scenario: Backspace Tolerance Across Hyphen Delimiters

- **GIVEN** the input value is `ABC-123` and the caret is positioned immediately after the hyphen at index 4 (`ABC-|123`)
- **WHEN** the user presses `Backspace`
- **THEN** the directive SHALL delete the character preceding the hyphen (`C`), resulting in `AB-123` or `AB123` reformatted without locking the cursor behind the delimiter.

#### Scenario: Unplated Bypass Mode

- **GIVEN** `country` is `'UNPLATED'`
- **WHEN** the user inputs text into the field
- **THEN** the directive SHALL NOT apply any delimiter or length restrictions, preserving raw input.

---

### Requirement: Interactive Live Operations Mockup (`mockup.html`)

The system SHALL provide a standalone, high-fidelity interactive HTML prototype at `openspec/changes/2026-10-16-plate-masks-and-live-ops/mockup.html` representing the complete live operations workflow for stakeholder review and operator speed trials.

#### Scenario: Live Operations Dashboard View

- **GIVEN** the prototype is opened in a browser
- **WHEN** navigating the dashboard view
- **THEN** the interface SHALL render real-time occupancy KPI cards (Total, Occupied, Rate, Shift Revenue, Average Stay Duration), dynamic slot matrix, and an active ticket table with search and vehicle type filters.

#### Scenario: Check-in Simulation with Live Plate Masking

- **GIVEN** the operator opens the Check-in Modal simulator
- **WHEN** selecting country pills (`Colombia`, `Venezuela`) and typing into the plate field
- **THEN** the input SHALL execute the real-time masking algorithm, display a dynamic validity badge, and add the vehicle into the active session table upon clicking "Emitir Ticket".

#### Scenario: Check-out Settlement Simulation

- **GIVEN** an active ticket selected in the table or searched by plate
- **WHEN** opening the Check-out drawer
- **THEN** the simulator SHALL compute elapsed stay duration, apply grace-period logic (under 15 minutes = free exit), calculate the itemized bill, and allow instant departure clearance.

#### Scenario: Digital Thermal QR Ticket Receipt Preview

- **GIVEN** a newly issued or existing ticket
- **WHEN** opening the thermal receipt view
- **THEN** the prototype SHALL display an 80mm thermal receipt card with barcode, functional SVG QR code, and actions to print or share via WhatsApp/Email.

---

## Delta: MODIFIED

### Requirement: `CheckInModalComponent` Mask Binding

The `CheckInModalComponent` template (`check-in-modal.html`) and TypeScript class (`check-in-modal.ts`) SHALL be modified to integrate `PlateMaskDirective`.

#### Scenario: Plate Input Directive Binding

- **GIVEN** the check-in modal is open
- **WHEN** rendering `#plateInput`
- **THEN** the input SHALL have `appPlateMask` applied with `[country]="facade.plateCountry()"` and `[vehicleType]="facade.vehicleType()"`.

#### Scenario: Dynamic Country Switch Re-masking

- **GIVEN** an existing input value `ABC123`
- **WHEN** the operator clicks the `Venezuela (VE)` country selector button
- **THEN** the directive and modal SHALL re-evaluate the input value under Venezuelan rules (`AB-123-...`).

---

## Delta: REMOVED

### Requirement: Unrestricted Raw Plate Input

The unmasked raw text input on `#plateInput` without character constraints is REMOVED in favor of the controlled `PlateMaskDirective`.
