# Nivo Design System Tokens & Guidelines

Source paths:
- `libs/design-system/src/lib/styles/tokens.css`
- `apps/web/src/styles.css`
- `libs/design-system/src/lib/tokens/colors.json`

## Colors (Light / Dark Oklch Tokens)

| Token Name | Light Value | Dark Value | Semantic Usage |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.141 0.005 285.823)` | Page and viewport canvas background |
| `--foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0 0)` | Primary high-contrast text |
| `--card` | `oklch(1 0 0)` | `oklch(0.141 0.005 285.823)` | Modals, panels, surfaces, cards |
| `--card-foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0 0)` | Text inside cards and modals |
| `--primary` | `oklch(0.21 0.006 285.885)` | `oklch(0.985 0 0)` | Primary buttons, active highlights, key accents |
| `--primary-foreground`| `oklch(0.985 0 0)` | `oklch(0.21 0.006 285.885)` | Text on primary buttons |
| `--secondary` | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Secondary interactive surfaces |
| `--secondary-foreground`| `oklch(0.21 0.006 285.885)` | `oklch(0.985 0 0)` | Text on secondary elements |
| `--muted` | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Subdued backgrounds, tags, disabled fills |
| `--muted-foreground` | `oklch(0.552 0.016 285.938)` | `oklch(0.705 0.015 286.067)` | Supporting labels, helper hints, placeholders |
| `--accent` | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Hover surfaces, subtle focus zones |
| `--accent-foreground` | `oklch(0.21 0.006 285.885)` | `oklch(0.985 0 0)` | Text on hover/accent elements |
| `--border` | `oklch(0.92 0.004 286.32)` | `oklch(0.274 0.006 286.033)` | Structural dividers and borders |
| `--input` | `oklch(0.92 0.004 286.32)` | `oklch(0.274 0.006 286.033)` | Input field boundaries |
| `--ring` | `oklch(0.21 0.006 285.885)` | `oklch(0.869 0.005 286.286)` | Focus indicators and active rings |
| `--semantic-success` | `oklch(0.627 0.194 149.214)` | `oklch(0.723 0.219 149.579)` | Confirmed states, active slots, green badges |
| `--semantic-warning` | `oklch(0.769 0.188 70.08)` | `oklch(0.795 0.184 86.047)` | Alerts, caution banners, low capacity |
| `--semantic-error` | `oklch(0.577 0.245 27.325)` | `oklch(0.637 0.237 25.331)` | Destructive actions, validation errors |

## Typography

- **Headings & Body Sans:** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Code & License Plates Mono:** `JetBrains Mono`, monospace
- **Scale:**
  - `text-xs`: 0.75rem (12px)
  - `text-sm`: 0.875rem (14px)
  - `text-base`: 1rem (16px)
  - `text-lg`: 1.125rem (18px)
  - `text-xl`: 1.25rem (20px)

## Radii & Spacing

- `--radius`: `0.5rem` (8px)
- `rounded-lg`: 8px
- `rounded-xl`: 12px
- `rounded-2xl`: 16px

## Core Components
- `nv-button`: Primary, Outline, Ghost, Destructive variants; sm, md, lg, icon sizes.
- `nv-card`: Header, content, footer sections with border and shadow.
- `nv-input`: Labels, start/end icons, helper hints, error messaging.
- `nv-badge`: Success, warning, destructive, secondary variants.
