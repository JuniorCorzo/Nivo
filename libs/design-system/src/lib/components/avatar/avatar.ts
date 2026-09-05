import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "wrapperClasses()",
  },
  selector: "nv-avatar",
  standalone: true,
  template: `
    @if (src()) {
      <img
        [src]="src()"
        [alt]="alt() || ''"
        loading="lazy"
        decoding="async"
        class="h-full w-full rounded-full border border-[var(--border)] bg-[var(--muted)] object-cover"
      />
    } @else {
      <div
        class="flex h-full w-full items-center justify-center rounded-full bg-[var(--muted)] font-sans font-semibold text-[var(--muted-foreground)] select-none"
      >
        {{ initials() }}
      </div>
    }
  `,
})
export class AvatarComponent {
  readonly src = input<string | undefined>();
  readonly alt = input<string | undefined>();
  readonly size = input<"sm" | "md" | "lg">("md");
  readonly name = input<string | undefined>();

  readonly initials = computed(() => {
    const n = this.name();
    if (!n) {
      return "•";
    }
    const words = n.trim().split(/\s+/u);
    return words
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  });

  readonly wrapperClasses = computed(() => {
    const base =
      "inline-flex shrink-0 overflow-hidden rounded-full border border-[var(--border)]";

    const sizes = {
      lg: "h-12 w-12 text-base",
      md: "h-10 w-10 text-sm",
      sm: "h-8 w-8 text-xs",
    } as const;

    return `${base} ${sizes[this.size()]}`;
  });
}
