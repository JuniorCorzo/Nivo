# Tasks: ANC-26 Rate Configuration UI

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~380 lines |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Core models, mappers, and RateService | PR 1 | `bun test rate.mapper.spec.ts rate-service.spec.ts` | N/A (headless domain layer) | `src/app/core/models/rate.model.ts`, `src/app/core/mappers/rate.mapper.ts`, `src/app/core/services/rate-service.ts` |
| 2 | Rate UI components, facade, calculator, and routes | PR 1 | `bun test rate-form.facade.spec.ts` | Visit `/app/parking-lots/:id/rates` in browser | `src/app/features/rates/`, `src/app/app.routes.ts` |

## Phase 1: Core Foundation & API Integration

- [x] 1.1 Create domain models and types in `apps/web/src/app/core/models/rate.model.ts`
- [x] 1.2 Create pure mapper functions in `apps/web/src/app/core/mappers/rate.mapper.ts`
- [x] 1.3 Implement `RateService` in `apps/web/src/app/core/services/rate-service.ts` wrapping OpenAPI endpoints
- [x] 1.4 Write unit tests in `src/app/core/mappers/rate.mapper.spec.ts` and `src/app/core/services/rate-service.spec.ts`

## Phase 2: Feature Facade & Business Logic

- [x] 2.1 Implement `RateFormFacade` with Angular Signals for reactive form state and calculation simulation
- [x] 2.2 Add unit tests for `RateFormFacade` in `apps/web/src/app/features/rates/facades/rate-form.facade.spec.ts`

## Phase 3: UI Components & Real-time Calculator

- [x] 3.1 Create `RateListComponent` with summary cards, status badges, and empty states
- [x] 3.2 Create dynamic `RateFormComponent` supporting minute/hourly/daily/tiered rate types with design system tokens
- [x] 3.3 Create `RateCalculatorComponent` & `RatePreviewComponent` for interactive calculation breakdown
- [x] 3.4 Create `SpecialPoliciesConfigComponent` for zone rules and surcharges/discounts

## Phase 4: Routing & Navigation Integration

- [x] 4.1 Update `apps/web/src/app/shared/constants/app-routes.constant.ts` and `app-texts.constant.ts` with rate paths and labels
- [x] 4.2 Register rate routes in `apps/web/src/app/app.routes.ts` and connect parking details navigation

## Phase 5: Verification & Polish

- [x] 5.1 Run test suite (`bun test`) and verify all specs pass
- [x] 5.2 Verify responsive layout and compliance with `nivo-brand-design` standards
