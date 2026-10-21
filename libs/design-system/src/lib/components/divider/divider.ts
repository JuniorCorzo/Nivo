import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerThickness = "thin" | "default" | "thick";
export type DividerVariant = "default" | "strong" | "subtle";

const DIMENSIONS = {
  horizontal: {
    default: "h-[2px] w-full rounded-full",
    thick: "h-[3px] w-full rounded-full",
    thin: "h-[1px] w-full rounded-full",
  },
  vertical: {
    default: "w-[2px] h-6 rounded-full",
    thick: "w-[3px] h-6 rounded-full",
    thin: "w-[1px] h-6 rounded-full",
  },
} as const satisfies Record<
  DividerOrientation,
  Record<DividerThickness, string>
>;

const VARIANTS = {
  default: "bg-neutral-300 dark:bg-neutral-700",
  strong: "bg-neutral-400 dark:bg-neutral-600",
  subtle: "bg-[var(--border)]",
} as const satisfies Record<DividerVariant, string>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[attr.aria-orientation]":
      "orientation() === 'vertical' ? 'vertical' : undefined",
    "[attr.role]": "role()",
    "[class]": "classes()",
  },
  selector: "nv-divider, nv-divisor",
  standalone: true,
  template: "",
})
export class DividerComponent {
  readonly orientation = input<DividerOrientation>("horizontal");
  readonly thickness = input<DividerThickness>("default");
  readonly variant = input<DividerVariant>("default");
  readonly decorative = input<boolean>(true);
  readonly className = input<string>("", { alias: "class" });

  readonly role = computed(() => (this.decorative() ? "none" : "separator"));

  readonly classes = computed(() => {
    const base = "shrink-0 block";
    const variantClass = VARIANTS[this.variant()];
    const dimensionClass = DIMENSIONS[this.orientation()][this.thickness()];
    const customClass = this.className();

    return `${base} ${variantClass} ${dimensionClass} ${customClass}`.trim();
  });
}
