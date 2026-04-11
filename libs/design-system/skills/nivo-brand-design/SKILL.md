---
name: nivo-brand-design
description: >
  Nivo brand design system for web: colors (Zinc-based, shadcn/ui inspired),
  typography (Inter + JetBrains Mono), logo rules, and voice/tone guidelines.
  Trigger: When designing or building UI components, pages, or any visual element
  for the Nivo web app. Also triggers on brand, color, typography, logo, or tone questions.
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

| Distribution | Tokens | Percentage |
|---|---|---|
| Neutros | Background, Foreground, Border | 80% |
| Primary | Inverted white/black | 10% |
| Semánticos | Success, Warning, Destructive, Info | 10% |

### 2. Color tokens by theme

**Dark theme (default):**

| Token | HEX | Use |
|---|---|---|
| Background / Card / Popover | `#09090b` | Fondo principal |
| Foreground | `#fafafa` | Texto principal |
| Muted Foreground | `#a1a1aa` | Texto secundario, labels |
| Muted | `#27272a` | Badges, fondos inactivos |
| Primary | `#fafafa` (text: `#18181b`) | Botón principal, CTAs |
| Secondary | `#27272a` (text: `#fafafa`) | Botón secundario |
| Accent | `#27272a` | Hover sidebar, item activo |
| Border / Input | `#27272a` | Bordes, divisores |
| Ring | `#d4d4d8` | Focus ring |
| Destructive | `#7f1d1d` (text: `#fafafa`) | Errores, plazas ocupadas |
| Success | `#22c55e` | Plazas disponibles, check-in OK |
| Warning | `#eab308` | Advertencias, reservas pendientes |
| Info | `#3b82f6` | Mensajes informativos |

**Light theme:**

| Token | HEX | Use |
|---|---|---|
| Background / Card / Popover | `#ffffff` | Fondo principal |
| Foreground | `#09090b` | Texto principal |
| Muted Foreground | `#71717a` | Texto secundario |
| Muted | `#f4f4f5` | Fondos sutiles |
| Primary | `#18181b` (text: `#fafafa`) | Botón principal, CTAs |
| Secondary | `#f4f4f5` (text: `#18181b`) | Botón secundario |
| Accent | `#f4f4f5` | Hover sidebar, item activo |
| Border / Input | `#e4e4e7` | Bordes, divisores |
| Ring | `#18181b` | Focus ring |
| Destructive | `#ef4444` (text: `#fafafa`) | Errores |
| Success | `#16a34a` | Confirmaciones |
| Warning | `#ca8a04` | Advertencias |
| Info | `#2563eb` | Informativos |

### 3. Typography system

| Level | Font | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|---|
| H1 | Inter | 48px / 3rem | Bold (700) | 56px | -1.2px |
| H2 | Inter | 36px / 2.25rem | Semibold (600) | 44px | -0.75px |
| H3 | Inter | 24px / 1.5rem | Semibold (600) | 32px | -0.5px |
| H4 | Inter | 20px / 1.25rem | Medium (500) | 28px | 0 |
| Body Large | Inter | 16px / 1rem | Regular (400) | 26px | 0 |
| Body Regular | Inter | 14px / 0.875rem | Regular (400) | 22px | 0 |
| Caption | Inter | 12px / 0.75rem | Regular (400) | 18px | 0 |
| Button Text | Inter | 14px / 0.875rem | Medium (500) | 20px | 0 |
| Code / Data | JetBrains Mono | 13px / 0.8125rem | Regular (400) | 20px | 0 |

- **Inter**: Everything (headings, body, UI, navigation)
- **JetBrains Mono**: Data numbers, plates, codes (with `font-feature-settings: "tnum"`)
- **Space Mono Bold**: ONLY for the logo — NEVER in the UI

### 4. Logo rules

**Variants:**

| Variant | Layout | Min size |
|---|---|---|
| Horizontal (main) | Isotipo left + wordmark right | 120px wide |
| Vertical (stacked) | Isotipo top + wordmark bottom | 80px wide |
| Solo isotipo | Icon only | 24x24px |

**Theme versions:**
- Dark: `#fafafa` on dark bg
- Light: `#09090b` on light bg

**PROHIBITED:**
- Stretch, rotate, or distort
- Colors outside Zinc tokens
- Shadows, gradients, or effects
- Dark version on light bg or vice versa
- Modifying the typography

**Safe area:** Minimum padding = height of the letter "N"

### 5. Voice & Tone

| Principle | Rule |
|---|---|
| Clarity | Direct messages, no jargon |
| Minimalism | Every word justifies its presence |
| Technical trust | Show expertise with data, not buzzwords |
| Action-oriented | CTAs with imperative verbs |

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
  --background: #09090b;
  --foreground: #fafafa;
  --card: #09090b;
  --popover: #09090b;
  --primary: #fafafa;
  --primary-foreground: #18181b;
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #27272a;
  --border: #27272a;
  --input: #27272a;
  --ring: #d4d4d8;
  --destructive: #7f1d1d;
  --success: #22c55e;
  --warning: #eab308;
  --info: #3b82f6;
}
```

### Typography classes

```css
.h1 { font: 700 3rem/56px Inter; letter-spacing: -1.2px; }
.h2 { font: 600 2.25rem/44px Inter; letter-spacing: -0.75px; }
.body { font: 400 0.875rem/22px Inter; }
.code-data {
  font: 400 0.8125rem/20px 'JetBrains Mono';
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
