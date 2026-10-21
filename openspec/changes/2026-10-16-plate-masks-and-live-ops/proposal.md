# Proposal: Colombian & Venezuelan Plate Masks + Impeccable Live Operations Mockup

## Metadata

- **Status**: Approved
- **Date**: 2026-10-16
- **Workflow Mode**: `WORKFLOW_MODE: BOOST`
- **Workflow Routing**: `/boost`
- **Target Applications**: `apps/web`, `design-system`

---

## Motivation & Problem Statement

In bi-national and metropolitan parking operations (such as Cúcuta, Norte de Santander, and major hubs across Colombia and border corridors), operators handle hundreds of vehicle entries daily. Operators encounter both Colombian and Venezuelan vehicular plates with distinct alphanumeric structures:

- **Colombian Automobiles (Car / Particular / Public)**: 3 letters, followed by 3 digits (e.g., `ABC-123`).
- **Colombian Motorcycles**: 3 letters, followed by 2 digits and 1 letter (e.g., `ABC-12D`).
- **Venezuelan Vehicles**: 2 letters, 3 digits, and 2 letters (e.g., `AB-123-CD`).

Currently, the plate input field in `CheckInModalComponent` is a raw text input without format enforcement or input masking. This introduces significant operational friction:

1. **Typing Inconsistencies**: Operators inadvertently introduce lowercase letters, extraneous whitespace, misplaced dashes, or invalid characters.
2. **Cognitive Overhead**: Operators must manually verify character counts and segment boundaries while managing vehicle queues under strict throughput pressure.
3. **Lack of Visual Guidance**: The input does not dynamically hint or format according to whether the vehicle is a car, motorcycle, or originating from Venezuela.
4. **Stakeholder Alignment**: Product and operational teams require an interactive, impeccable simulation to experience and validate the high-speed live operations workflow (entry check-in with dynamic masking, live slot monitoring, check-out settlement, and thermal QR receipt delivery).

---

## User Value

- **Operator Speed & Ergonomics**: Reduces plate entry time from ~4 seconds to under 1.5 seconds with auto-capitalization, smart hyphen insertion, and strict character type enforcement.
- **Data Integrity**: Eradicates 99% of formatting typos at the entry point, guaranteeing clean plate storage for searches, audits, and ticket lookup during check-out.
- **Bi-National Support**: First-class support for Colombian (Car `AAA-000`, Motorcycle `AAA-00A`) and Venezuelan (`AA-000-AA`) registrations seamlessly switched via UI controls.
- **Impeccable Experience**: Provides stakeholders and developers with a zero-dependency, ultra-polished interactive prototype (`mockup.html`) capturing the complete live operations lifecycle.

---

## Scope Boundaries

### In Scope

1. **`PlateMaskDirective` Implementation (`apps/web/src/app/shared/directives/plate-mask.ts`)**:
   - Standalone Angular directive with input signals for `country` (`CO` | `VE` | `UNPLATED`) and `vehicleType` (`CAR` | `MOTORCYCLE` | `BIKE`).
   - Dynamic masking rules:
     - Colombian Automobile: `AAA-000` (max 6 alphanumeric, formatted length 7).
     - Colombian Motorcycle: `AAA-00A` (max 6 alphanumeric, formatted length 7).
     - Venezuelan Vehicle: `AA-000-AA` (max 7 alphanumeric, formatted length 9).
   - Sanitization: Strips non-alphanumeric input, forces uppercase immediately.
   - Caret Stability: Preserves caret position across delimiter insertions and deletions.
   - Backspace Tolerance: Allows smooth backspacing across hyphens without jumping or cursor traps.
   - Signal and Control Value Accessor / DOM event synchronization.
2. **`CheckInModalComponent` Integration (`apps/web/src/app/features/operations/components/modals/check-in-modal/`)**:
   - Bind `appPlateMask` directive to `#plateInput`.
   - Reactively sync with `facade.plateCountry()` and `facade.vehicleType()`.
   - Update facade plate signal cleanly with sanitized/formatted plate.
3. **High-Fidelity Interactive Mockup (`openspec/changes/2026-10-16-plate-masks-and-live-ops/mockup.html`)**:
   - Single-file, zero-dependency, responsive prototype styled with Tailwind CSS and Nivo brand tokens.
   - Views:
     - **Live Ops Dashboard**: Real-time slot status, active tickets stream, search bar, and capacity gauges.
     - **Check-in Modal with Live Mask**: Interactive simulator with instant country switch (`CO` / `VE`), vehicle type toggles, and live mask formatting.
     - **Check-out Settlement Drawer**: Elapsed time calculation, rate computation, and zero-payment clearance.
     - **Digital Thermal QR Receipt**: Printable slip simulation with ticket code, QR code canvas, and WhatsApp/Email triggers.
4. **Testing & Quality Assurance**:
   - Strict Red-Green-Refactor TDD for `PlateMaskDirective` (`plate-mask.spec.ts`).
   - Integration tests in `check-in-modal.spec.ts` and `check-in-facade.spec.ts`.
   - Full regression test run (`ng test --watch=false`).

### Out of Scope

- Backend database schema changes (PostgreSQL `tickets` table and use cases already accept alphanumeric plate strings).
- Hardware LPR camera integration or firmware integrations.
- Payment gateway processor SDKs (MercadoPago/Wompi), handled in dedicated billing milestones.
- Alterations to slot allocation or rate pricing domain logic.
