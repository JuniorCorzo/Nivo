# Nivo Design System (`@nivo-sass/design-system`)

Official design system for Nivo. Provides harmonic OKLCH visual tokens, accessible and reusable Angular 21 standalone components, and an interactive catalog in Storybook 10.

## Quick Path

### 1. Start Storybook

Explore and interact with the complete component catalog:

```bash
# From libs/design-system:
bun run storybook

# Or from monorepo root:
bun run dev:design-system
```

Available at [http://localhost:6006](http://localhost:6006).

### 2. Build Library

Generates design tokens, compiles with `ng-packagr`, builds Tailwind CSS v4, and generates publication artifacts in `dist/libs/design-system`:

```bash
# From libs/design-system:
bun run build

# Or from monorepo root:
bun run dev:build
```

### 3. Run Tests

```bash
bun run test
```

---

## Available Components

All components are built with **Angular Standalone Components** and adhere to `OnPush` change detection:

| Component | Selector | Description |
|---|---|---|
| **Alert** | `nv-alert` | Contextual banners (info, success, warning, danger) |
| **Avatar** | `nv-avatar` | User avatar supporting initials, image URLs, and online/offline status |
| **Badge** | `nv-badge` | Status tags for vehicles, parking slots, and payment states |
| **Button** | `nv-button` | Primary, secondary, outline, ghost, and destructive action buttons |
| **Card** | `nv-card` | Structured container supporting header, body, and footer content projection |
| **Checkbox** | `nv-checkbox` | Accessible boolean selection control |
| **Combobox** | `nv-combobox` | Searchable dropdown with live autocomplete |
| **Divider** | `nv-divider` | Horizontal and vertical layout separators |
| **Input** | `nv-input` | Accessible text, search, number, and password input fields |
| **Loader** | `nv-loader` | Progress spinners and loading indicators |
| **Modal** | `nv-modal` | Accessible dialogs for vehicle check-in, check-out, and settings |
| **Select** | `nv-select` | Strongly typed dropdown menus |
| **Table** | `nv-table` | Data tables compatible with `@tanstack/angular-table` |
| **Toasts** | Provider | Floating toast notifications integrated with `@ngxpert/hot-toast` |
| **Typography** | `nv-typography` | Scalable typographic hierarchy |

---

## Project Structure

```
libs/design-system/
├── scripts/                     # Automation scripts (token generation, packaging patches)
├── src/
│   ├── lib/
│   │   ├── components/          # Standalone Angular components
│   │   ├── styles/              # CSS tokens (tokens.css) and component utility classes (components.css)
│   │   └── tokens/              # OKLCH color palettes and typographic design tokens
│   └── public-api.ts            # Public entry point of the package
├── ng-package.json              # ng-packagr configuration
└── package.json                 # @nivo-sass/design-system manifest
```

---

## Usage & Integration

### In Monorepo Angular Applications

`@nivo-sass/design-system` is configured as a workspace package (`workspace:*`).

1. **Import standalone components**:
   ```ts
   import { Component } from '@angular/core';
   import { ButtonComponent, CardComponent, BadgeComponent } from '@nivo-sass/design-system';

   @Component({
     standalone: true,
     imports: [ButtonComponent, CardComponent, BadgeComponent],
     template: `
       <nv-card>
         <nv-badge variant="success">Occupied</nv-badge>
         <nv-button variant="primary">View Details</nv-button>
       </nv-card>
     `
   })
   export class SlotCardComponent {}
   ```

2. **Import global styles and tokens**:
   In your global `styles.css` (or through Tailwind CSS):
   ```css
   @import "@nivo-sass/design-system/styles/tokens.css";
   @import "@nivo-sass/design-system/styles/components.css";
   ```

---

## Available Commands

| Command | Description |
|---|---|
| `bun run storybook` | Start local Storybook development server (`:6006`) |
| `bun run build-storybook` | Compile static Storybook bundle for deployment |
| `bun run generate:tokens` | Regenerate CSS token variables from base definitions |
| `bun run build` | Full pipeline: tokens -> ng-packagr -> CSS -> patch exports |
| `bun run test` | Run unit tests with Vitest |
| `bun run check` | Run linter and formatter diagnostics (`ultracite check`) |
| `bun run fix` | Auto-fix formatting and style issues (`ultracite fix`) |
| `npm run pack:dist` | Create local test tarball from `dist/libs/design-system` |
| `npm run publish:dist` | Publish compiled package to npm (`--access public`) |

> [!IMPORTANT]
> Never run `npm publish` from the root of `libs/design-system`. The `prepublishOnly` lifecycle hook blocks accidental publication of uncompiled source code. Always use `npm run publish:dist`.
