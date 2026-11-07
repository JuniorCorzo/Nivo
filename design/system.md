# Nivo Design System Tokens & Guidelines

> Source of truth: `libs/design-system/src/lib/styles/tokens.css`, `apps/web/src/styles.css`

## Colors (OKLCH Light / Dark)

| Token | Light Value | Dark Value | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `oklch(1 0 0)` | `oklch(0.141 0.005 285.823)` | App background canvas |
| `--foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0 0)` | Main body text |
| `--card` | `oklch(1 0 0)` | `oklch(0.141 0.005 285.823)` | Surface cards |
| `--card-foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0 0)` | Card typography |
| `--primary` | `oklch(0.21 0.006 285.885)` | `oklch(0.985 0 0)` | High-emphasis CTA & branding |
| `--primary-foreground`| `oklch(0.985 0 0)` | `oklch(0.21 0.006 285.885)` | Text on primary |
| `--secondary` | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)`| Subtle buttons & chips |
| `--muted` | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)`| Inactive backgrounds |
| `--muted-foreground` | `oklch(0.552 0.016 285.938)` | `oklch(0.705 0.015 286.067)`| Secondary helper text |
| `--border` | `oklch(0.92 0.004 286.32)` | `oklch(0.274 0.006 286.033)`| Card & control borders |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.637 0.237 25.331)`| Danger / error states |
| `--semantic-success` | `oklch(0.627 0.194 149.214)`| `oklch(0.723 0.219 149.579)`| Active, approved, success |
| `--semantic-warning` | `oklch(0.769 0.188 70.08)` | `oklch(0.795 0.184 86.047)` | Mora, alert, attention |
| `--semantic-info` | `oklch(0.588 0.216 252.89)` | `oklch(0.623 0.214 259.815)`| Informational tags & rates |

## Typography

- **Headings & Body Font**: `"Inter", system-ui, -apple-system, sans-serif`
- **Monospace Font**: `"JetBrains Mono", monospace` (Used for currency `$`, durations `08h 00m`, coordinates, and metrics)
- **Hierarchy**:
  - `h1`: 24px - 32px, font-bold, tracking-tight
  - `h2`: 18px - 20px, font-semibold
  - `h3`: 14px - 16px, font-bold
  - `body`: 13px - 14px, font-normal
  - `caption / helper`: 11px - 12px, font-medium

## Spacing & Radius

- `--radius`: `0.5rem` (8px standard, cards `1rem` / 16px rounded-2xl)
- Standard grid gaps: `0.75rem` (12px), `1rem` (16px), `1.5rem` (24px)

## Component Rules

- Cards use `.border-border` with subtle shadows (`shadow-xs` / `shadow-sm`).
- Buttons use `nv-button` variants: `default` (primary dark/light), `secondary` (soft surface), `outline` (bordered), `ghost` (transparent hover).
- Badges use semantically tinted background with matching text and subtle 20% border.
