# Checkout Modal Rules Compliance and Refactoring
Branch: feat/stack-02-checkout-modal-engine
Delivery: single-pr
Test runner: bun --cwd apps/web ng test --include="src/app/features/operations/components/modals/check-out-modal/**/*.spec.ts" --watch=false

## Specs
S1: Enforce strict immutability in backend rates classes by adding final to all parameters in DeleteRateUseCase, RateInUseException, and RatesRepositoryAdapter.
S2: Move CheckoutPaymentMethod from check-out.facade.ts to @core/models/ticket.model.ts to satisfy model isolation rule.
S3: Add checkoutModal dictionary to APP_TEXTS (app-texts.constant.ts) and bind all user-facing text, placeholders, labels, and toasts to APP_TEXTS.
S4: Replace raw <input> with nv-input and raw <button> with nv-button (and accessible options) across checkout modal step templates.
S5: Decompose templates (identification-step.html, settlement-step.html, payment-step.html, check-out-modal.html) into subcomponents (e.g. check-out-stepper, stay-timeline, tariff-breakdown) to achieve template length < 150 lines complying with angular-component-audit rules. Clean up dead code (onEmailInput, unused icons).
S6: Ensure all unit tests pass, format check passes (bun run format:all:check), and tests verify regressions.
S7: Expose paymentEnabled feature flag in backend PublicConfigResponse and PublicConfigController (derived from payment.enabled property).
S8: Support paymentEnabled in frontend FeatureFlagService and bind checkout facade to enforce cash-only (EFFECTIVE) when digital payments are disabled.
S9: Update PaymentMethodSelectorComponent to render only cash payment option and display effectiveOnlyNotice when payment module is disabled.
S10: Full verification and documentation of rules compliance across Angular components and Java Clean Architecture.

## Tasks
- [x] T1: [S1, S2] delegated fix backend final immutability and move CheckoutPaymentMethod to ticket.model.ts (ee36336, cede920)
- [x] T2: [S3] delegated add checkoutModal to APP_TEXTS and update check-out.facade toasts (83d7be1)
- [x] T3: [S3, S4, S5] delegated refactor identification-step with nv-input, nv-button, and APP_TEXTS (45d3f1f)
- [x] T4: [S3, S4, S5] delegated refactor settlement-step with APP_TEXTS and extract breakdown/timeline dumb components (6601df0)
- [x] T5: [S3, S4, S5] delegated refactor payment-step with nv-input, nv-button, and APP_TEXTS (6a45210)
- [x] T6: [S3, S4, S5] delegated refactor check-out-modal extracting stepper and cleaning dead code (c705f4d)
- [x] T7: [S6] delegated full verification with format check and test suite (39/39 tests passed, format:all:check passed)
- [x] T8: [S7] delegated expose paymentEnabled flag in backend public config endpoint (7383d19)
- [x] T9: [S8] delegated integrate paymentEnabled feature flag in checkout facade and core (e80f008)
- [x] T10: [S9, S10] delegated restrict payment step to cash only when payment module is disabled and full audit (ee8d3db)

## Log
L1: User request: "si adelante" to audit findings and remediation plan.
L2: User request: "hay un tema dentro de la seccion de pagar en el modal de payment, antes se implemento un interructor para desabilitar payments, la idea es que si detecta que el modulo de payment esta desactivado solo deberia mostrar pago en efectivo, o bueno no mostrarlo pero si el pago se registra como efectivo, despues cuando estes auditando los cambios que se revise que cumpla con las rules".
L3: User request: "deje bien documentado lo que hagas".
