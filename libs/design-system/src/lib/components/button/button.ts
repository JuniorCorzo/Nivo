import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "contents",
  },
  selector: "nv-button, button[nv-button], a[nv-button]",
  standalone: true,
  template: `
    <button [type]="type()" [disabled]="disabled()" [class]="classes()">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<
    "default" | "secondary" | "destructive" | "ghost" | "outline"
  >("default");
  readonly size = input<"sm" | "md" | "lg" | "icon">("md");
  readonly disabled = input<boolean>(false);
  readonly type = input<"button" | "submit" | "reset">("button");
  readonly className = input<string>("", { alias: "class" });

  readonly classes = computed(() => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 font-sans cursor-pointer";

    const variants = {
      default:
        "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90",
      destructive:
        "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
      ghost: "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
      outline:
        "border border-[var(--border)] bg-transparent hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
      secondary:
        "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80",
    } as const;

    const sizes = {
      icon: "h-10 w-10",
      lg: "h-11 px-8 text-base",
      md: "h-10 px-4 text-sm",
      sm: "h-8 px-3 text-xs",
    } as const;

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${this.className()}`.trim();
  });
}
