<!-- TAG: MODIFIED -->
# Delta Spec: Web Slots Directory Architecture Refactor

## Motivation
Align `apps/web/src/app/features/slots` with Nivo architectural conventions separating `components/`, `facades/`, and `page/`.

## Requirements
1. **Folder Restructuring**:
   - Move smart routed pages to `page/parking-slots-list/` and `page/parking-slot-form/`.
   - Move state management facades to `facades/parking-slots-list.facade.ts` and `facades/parking-slot-form.facade.ts`.
   - Keep presentational components and modals under `components/`.
2. **Regression-Free**:
   - Update all import paths and router configurations with 100% test pass rate.\n