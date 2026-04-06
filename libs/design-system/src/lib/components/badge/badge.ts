import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";

@Component({
  selector: "nv-badge",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class BadgeComponent {
  readonly variant = input<
    | "default"
    | "secondary"
    | "destructive"
    | "success"
    | "warning"
    | "info"
    | "outline"
  >("default");

  readonly classes = computed(() => {
    const base =
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors font-sans";

    const variants: Record<string, string> = {
      default:
        "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]",
      secondary:
        "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]",
      destructive:
        "border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)]",
      success:
        "border-transparent bg-[var(--success)]/20 text-[var(--success)]",
      warning:
        "border-transparent bg-[var(--warning)]/20 text-[var(--warning)]",
      info: "border-transparent bg-[var(--info)]/20 text-[var(--info)]",
      outline: "border-[var(--border)] text-[var(--foreground)]",
    };

    return `${base} ${variants[this.variant()]}`;
  });
}
