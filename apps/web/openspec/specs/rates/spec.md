# Rates Specification

## Purpose

Define frontend requirements for configuring, managing, and calculating parking rates, special policies, and real-time pricing simulations.

## Requirements

### Requirement: Rate Overview and Listing

The system MUST display a summary list of all configured rates for a specific parking lot, including rate type, base amount, vehicle type, and active status.

#### Scenario: View configured rates for parking lot

- GIVEN an authenticated tenant administrator on the parking rates page
- WHEN the parking rates view loads
- THEN the system MUST display all configured rates with their type, vehicle category, base rate, and status badges.

#### Scenario: Empty rates state

- GIVEN a parking lot with no configured rates
- WHEN the rates view loads
- THEN the system MUST display an empty state placeholder prompting the user to create the first rate.

### Requirement: Dynamic Rate Creation and Editing

The system MUST provide a dynamic configuration form adapted to the selected rate type (minute, hour, day, tiered/flat rate).

#### Scenario: Create hourly rate with grace period

- GIVEN the rate configuration form is open
- WHEN the administrator selects rate type "HOURLY", enters base price "5000", vehicle type "CAR", and grace period "15 minutes"
- AND submits the form
- THEN the system MUST validate inputs in real-time, create the rate via the API, and refresh the rates summary list.

#### Scenario: Validation on missing required rate parameters

- GIVEN an administrator entering a new rate
- WHEN base price is negative or vehicle type is unselected
- THEN the system MUST disable submission and display inline validation errors.

### Requirement: Special Policies and Surcharges Configuration

The system MUST allow configuring special pricing policies, weekend/holiday multipliers, and zone-specific rules.

#### Scenario: Add special zone policy

- GIVEN an existing base rate configuration
- WHEN the user adds a special condition for "VIP Zone" with a 20% surcharge
- THEN the system MUST attach the policy to the rate rule and reflect it in the policy breakdown.

### Requirement: Real-time Price Calculator and Preview

The system MUST provide an interactive calculator that computes estimated parking costs in real time given vehicle type, duration/entry-exit timestamps, and applicable zones.

#### Scenario: Real-time calculation simulation

- GIVEN an active rate configuration
- WHEN the user inputs entry time "08:00", exit time "10:30", and vehicle type "CAR"
- THEN the calculator MUST display an immediate price breakdown and total estimated cost according to the configured rate rules and grace periods.

#### Scenario: Preview updates immediately on form changes

- GIVEN the rate form with live preview enabled
- WHEN the administrator modifies base price or rate type
- THEN the live preview component MUST re-render simulated calculation results instantly without page reload.
