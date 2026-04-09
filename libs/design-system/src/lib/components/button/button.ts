import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "nv-button",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 font-sans";

    const variants: Record<string, string> = {
      default:
        "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90",
      secondary:
        "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80",
      destructive:
        "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
      ghost: "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
      outline:
        "border border-[var(--border)] bg-transparent hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
    };

    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-8 text-base",
      icon: "h-10 w-10",
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${this.className()}`.trim();
  });
}
