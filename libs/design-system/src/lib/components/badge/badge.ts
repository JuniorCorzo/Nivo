import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-badge",
  standalone: true,
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

    const variants = {
      default:
        "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]",
      destructive:
        "border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)]",
      info: "border-transparent bg-[var(--semantic-info)]/20 text-[var(--semantic-info)]",
      outline: "border-[var(--border)] text-[var(--foreground)]",
      secondary:
        "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]",
      success:
        "border-transparent bg-[var(--semantic-success)]/20 text-[var(--semantic-success)]",
      warning:
        "border-transparent bg-[var(--semantic-warning)]/20 text-[var(--semantic-warning)]",
    } as const;

    return `${base} ${variants[this.variant()]}`;
  });
}
