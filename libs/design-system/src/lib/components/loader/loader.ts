import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type LoaderVariant = "default" | "primary" | "muted" | "white";
export type LoaderSize = "sm" | "md" | "lg";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[attr.aria-live]": "'polite'",
    "[attr.role]": "'status'",
    class: "inline-flex items-center justify-center",
  },
  selector: "nv-loader, nv-spinner",
  standalone: true,
  template: `
    <svg
      [class]="svgClasses()"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span class="sr-only">{{ label() }}</span>
  `,
})
export class LoaderComponent {
  readonly variant = input<LoaderVariant>("default");
  readonly size = input<LoaderSize>("md");
  readonly label = input<string>("Cargando...");
  readonly className = input<string>("", { alias: "class" });

  readonly svgClasses = computed(() => {
    const base = "animate-spin";

    const sizes = {
      lg: "h-9 w-9",
      md: "h-6 w-6",
      sm: "h-4 w-4",
    } as const satisfies Record<LoaderSize, string>;

    const variants = {
      default: "text-current",
      muted: "text-neutral-400 dark:text-neutral-500",
      primary: "text-[var(--primary)]",
      white: "text-white",
    } as const satisfies Record<LoaderVariant, string>;

    return `${base} ${sizes[this.size()]} ${variants[this.variant()]} ${this.className()}`.trim();
  });
}
