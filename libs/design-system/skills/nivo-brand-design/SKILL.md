---
name: nivo-brand-design
description: >
  Nivo brand design system for web: colors (Zinc-based, OKLCH perceptual color space, shadcn/ui inspired), typography (Inter + JetBrains Mono), logo rules, and voice/tone guidelines. Trigger: When designing or building UI components, pages, or any visual element for the Nivo web app. Also triggers on brand, color, typography, logo, or tone questions.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Building or styling UI components for the Nivo web app
- Choosing colors, typography, or spacing for a new feature
- Deciding which semantic color to use for a state (success, error, warning)
- Applying the Nivo logo in any context
- Writing UI copy, marketing text, or documentation tone

## Critical Patterns

### 1. Color is INFORMATIVE, not decorative

The ONLY chromatic colors are the 4 semantic states. Everything else is Zinc grayscale.

| Distribution | Tokens                              | Percentage |
| ------------ | ----------------------------------- | ---------- |
| Neutros      | Background, Foreground, Border      | 80%        |
| Primary      | Inverted white/black                | 10%        |
| Semánticos   | Success, Warning, Destructive, Info | 10%        |

#### Perceptual Uniformity Philosophy & OKLCH

Nivo color tokens use the OKLCH color space (`oklch(L C H)`), ensuring perceptual uniformity and accessibility:
- **Perceptual lightness ($L$)**: Unlike sRGB/HEX where identical hex lightness yields wildly different perceived brightness across hues (e.g. yellow vs. blue), OKLCH lightness corresponds directly to human eye perception.
- **Predictable contrast & WCAG compliance**: Contrast ratios against background tokens remain consistent across themes and hues, guaranteeing WCAG AA (>= 4.5:1 for body text) and AAA compliance without trial-and-error adjustments.
- **Harmonic theme transitions**: Light and dark mode tokens are paired by perceptual lightness and chroma, preventing hue drift and brightness flash during theme switches.
- **Calibrated chroma ($C$)**: Semantic states (Success, Warning, Info, Destructive) utilize high-fidelity chroma calibrated against the neutral Zinc background to avoid visual fatigue while maintaining immediate recognition.

### 2. Color tokens by theme

**Dark theme (default):**

| Token | OKLCH | Use |
| ----- | ----- | --- |
| Background / Card / Popover | `oklch(0.141 0.005 285.823)` | Fondo principal y superficies elevadas |
| Foreground / Card Foreground / Popover Foreground | `oklch(0.985 0 0)` | Texto principal e iconos |
| Primary | `oklch(0.985 0 0)` (text: `oklch(0.21 0.006 285.885)`) | Botón principal, CTAs destacados |
| Secondary | `oklch(0.274 0.006 286.033)` (text: `oklch(0.985 0 0)`) | Botón secundario |
| Muted | `oklch(0.274 0.006 286.033)` | Badges, fondos sutiles/inactivos |
| Muted Foreground | `oklch(0.705 0.015 286.067)` | Texto secundario, labels, placeholders |
| Accent | `oklch(0.274 0.006 286.033)` (text: `oklch(0.985 0 0)`) | Hover sidebar, item activo |
| Destructive / Semantic Error | `oklch(0.637 0.237 25.331)` (text: `oklch(0.985 0 0)`) | Errores, plazas ocupadas, acciones destructivas |
| Border / Input | `oklch(0.274 0.006 286.033)` | Bordes, divisores, inputs |
| Ring | `oklch(0.869 0.005 286.286)` | Focus ring |
| Semantic Success | `oklch(0.723 0.219 149.579)` | Plazas disponibles, check-in OK, operaciones exitosas |
| Semantic Warning | `oklch(0.795 0.184 86.047)` | Advertencias, reservas pendientes |
| Semantic Info | `oklch(0.623 0.214 259.815)` | Mensajes informativos, tips |

**Light theme:**

| Token | OKLCH | Use |
| ----- | ----- | --- |
| Background / Card / Popover | `oklch(1 0 0)` | Fondo principal y superficies |
| Foreground / Card Foreground / Popover Foreground | `oklch(0.141 0.005 285.823)` | Texto principal e iconos |
| Primary | `oklch(0.21 0.006 285.885)` (text: `oklch(0.985 0 0)`) | Botón principal, CTAs |
| Secondary | `oklch(0.967 0.001 286.375)` (text: `oklch(0.21 0.006 285.885)`) | Botón secundario |
| Muted | `oklch(0.967 0.001 286.375)` | Fondos sutiles |
| Muted Foreground | `oklch(0.552 0.016 285.938)` | Texto secundario, placeholders |
| Accent | `oklch(0.967 0.001 286.375)` (text: `oklch(0.21 0.006 285.885)`) | Hover sidebar, item activo |
| Destructive / Semantic Error | `oklch(0.577 0.245 27.325)` (text: `oklch(0.985 0 0)`) | Errores, acciones destructivas |
| Border / Input | `oklch(0.92 0.004 286.32)` | Bordes, divisores, inputs |
| Ring | `oklch(0.21 0.006 285.885)` | Focus ring |
| Semantic Success | `oklch(0.627 0.194 149.214)` | Confirmaciones, check-in OK |
| Semantic Warning | `oklch(0.769 0.188 70.08)` | Advertencias, reservas pendientes |
| Semantic Info | `oklch(0.588 0.216 252.89)` | Informativos |

**Zinc Palette Reference (OKLCH):**

| Scale | OKLCH | Role in System |
| ----- | ----- | -------------- |
| 50 | `oklch(0.985 0 0)` | Lightest neutral, dark foreground / primary |
| 100 | `oklch(0.967 0.001 286.375)` | Light secondary / muted / accent |
| 200 | `oklch(0.92 0.004 286.32)` | Light border / input |
| 300 | `oklch(0.869 0.005 286.286)` | Dark ring |
| 400 | `oklch(0.705 0.015 286.067)` | Dark muted-foreground |
| 500 | `oklch(0.552 0.016 285.938)` | Light muted-foreground |
| 600 | `oklch(0.442 0.017 285.786)` | Mid neutral |
| 700 | `oklch(0.37 0.013 285.805)` | Mid-dark neutral |
| 800 | `oklch(0.274 0.006 286.033)` | Dark secondary / muted / accent / border / input |
| 900 | `oklch(0.21 0.006 285.885)` | Light primary / ring, dark primary-foreground |
| 950 | `oklch(0.141 0.005 285.823)` | Dark background / card / popover, light foreground |

### 3. Typography system

| Level        | Font           | Size             | Weight         | Line-height | Tracking |
| ------------ | -------------- | ---------------- | -------------- | ----------- | -------- |
| H1           | Inter          | 30px / 1.875rem  | Bold (700)     | 36px        | -0.75px  |
| H2           | Inter          | 24px / 1.5rem    | Semibold (600) | 32px        | -0.5px   |
| H3           | Inter          | 20px / 1.25rem   | Semibold (600) | 28px        | -0.25px  |
| H4           | Inter          | 18px / 1.125rem  | Semibold (600) | 24px        | 0        |
| H5           | Inter          | 16px / 1rem      | Semibold (600) | 24px        | 0        |
| H6           | Inter          | 14px / 0.875rem  | Semibold (600) | 20px        | 0        |
| Body Large   | Inter          | 16px / 1rem      | Regular (400)  | 26px        | 0        |
| Body Regular | Inter          | 14px / 0.875rem  | Regular (400)  | 22px        | 0        |
| Caption      | Inter          | 12px / 0.75rem   | Regular (400)  | 18px        | 0        |
| Button Text  | Inter          | 14px / 0.875rem  | Medium (500)   | 20px        | 0        |
| Code / Data  | JetBrains Mono | 13px / 0.8125rem | Regular (400)  | 20px        | 0        |

- **Inter**: Everything (headings, body, UI, navigation)
- **JetBrains Mono**: Data numbers, plates, codes (with `font-feature-settings: "tnum"`)
- **Space Mono Bold**: ONLY for the logo — NEVER in the UI

### 4. Logo rules

**Variants:**

| Variant            | Layout                        | Min size   |
| ------------------ | ----------------------------- | ---------- |
| Horizontal (main)  | Isotipo left + wordmark right | 120px wide |
| Vertical (stacked) | Isotipo top + wordmark bottom | 80px wide  |
| Solo isotipo       | Icon only                     | 24x24px    |

**Theme versions:**

- Dark: `oklch(0.985 0 0)` (zinc-50) on dark bg
- Light: `oklch(0.141 0.005 285.823)` (zinc-950) on light bg

**PROHIBITED:**

- Stretch, rotate, or distort
- Colors outside Zinc tokens
- Shadows, gradients, or effects
- Dark version on light bg or vice versa
- Modifying the typography

**Safe area:** Minimum padding = height of the letter "N"

### 5. Voice & Tone

| Principle       | Rule                                    |
| --------------- | --------------------------------------- |
| Clarity         | Direct messages, no jargon              |
| Minimalism      | Every word justifies its presence       |
| Technical trust | Show expertise with data, not buzzwords |
| Action-oriented | CTAs with imperative verbs              |

**Action verbs:** Centraliza, Controla, Optimiza, Gestiona

**UI tone:** Instructive, concise, functional

> "Selecciona una plaza disponible"

**Marketing tone:** Convincing but honest

> "Gestiona múltiples parqueaderos desde un solo panel"

**NEVER use:** Hyperbole ("revolucionario"), absolute promises ("la solución definitiva"), unnecessary tech jargon

## Code Examples

### CSS custom properties (dark theme)

```css
:root {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.141 0.005 285.823);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.141 0.005 285.823);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.637 0.237 25.331);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.274 0.006 286.033);
  --input: oklch(0.274 0.006 286.033);
  --ring: oklch(0.869 0.005 286.286);
  --semantic-success: oklch(0.723 0.219 149.579);
  --semantic-warning: oklch(0.795 0.184 86.047);
  --semantic-info: oklch(0.623 0.214 259.815);
  --semantic-error: oklch(0.637 0.237 25.331);
}
```

### Typography classes

```css
.h1 {
  font: 700 1.875rem/36px Inter;
  letter-spacing: -0.75px;
}
.h2 {
  font: 600 1.5rem/32px Inter;
  letter-spacing: -0.5px;
}
.body {
  font: 400 0.875rem/22px Inter;
}
.code-data {
  font: 400 0.8125rem/20px "JetBrains Mono";
  font-feature-settings: "tnum";
}
```

### Semantic color decision tree

```
Is this a state or status?
├── Error / occupied / failed    → Destructive
├── Available / confirmed / OK   → Success
├── Pending / caution / waiting  → Warning
├── Informational / tooltip      → Info
└── Not a state?
    ├── Primary action / CTA     → Primary (white/black)
    ├── Secondary action         → Secondary
    ├── Structure / layout       → Zinc neutrals
    └── ANYTHING ELSE            → Zinc neutrals (NOT a new color)
```

## Commands

```bash
# No build commands needed - this is a design reference skill
# Use alongside the design-system lib at libs/design-system
```

## Resources

- **Strategy & positioning**: See [references/brand-strategy.md](references/brand-strategy.md)
- **Full color system**: See [references/brand-colors.md](references/brand-colors.md)
- **Typography specs**: See [references/brand-typography.md](references/brand-typography.md)
- **Logo & variants**: See [references/brand-logo.md](references/brand-logo.md)
- **Voice & tone**: See [references/brand-voice.md](references/brand-voice.md)
