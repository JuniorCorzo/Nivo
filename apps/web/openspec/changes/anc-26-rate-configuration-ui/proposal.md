## Why

Implementation of ANC-26 (`[Frontend] Implementar interfaces de configuración de tarifas`, part of HU-04 `ANC-25`). Operators and parking administrators need clear and dynamic interfaces to configure base and specialized parking rates, configure zone-specific surcharges/discounts, and simulate calculations in real time before publishing rates.

## What Changes

- Dedicated rates management views under parking administration context.
- Rate summary view listing active and configured rates for a parking lot.
- Dynamic rate configuration form supporting multiple rate types (per minute, hourly, daily, tiered).
- Special policies and zone configurator for conditional rate rules.
- Interactive real-time rate calculator and preview component.
- Core models, mappers, and service integration with backend rate endpoints (`/parking-lots/{id}/rates`, `/rate/*`, `/tenant/special-policies`).

## Capabilities

### New Capabilities
- `rates`: Complete rates management, forms, dynamic types, special zones, and live calculator.

## Impact

- Provides parking administrators complete control over pricing structure.
- Integrates reactive forms and calculation preview.
- Adds dedicated rate models and services in `apps/web/src/app/core`.
