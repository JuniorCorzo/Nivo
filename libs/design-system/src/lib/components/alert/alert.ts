import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";

type AlertVariant = "default" | "success" | "warning" | "destructive" | "info";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-alert",
  standalone: true,
  template: `
    <div [class]="classes()" role="alert">
      @if (icon()) {
        <span class="mr-2">{{ icon() }}</span>
      }
      @if (title()) {
        <h4 class="mb-1 font-sans leading-none font-semibold tracking-tight">
          {{ title() }}
        </h4>
      }
      <ng-content />
    </div>
  `,
})
export class AlertComponent {
  readonly variant = input<AlertVariant>("default");
  readonly title = input<string | undefined>();
  readonly icon = input<string | undefined>();

  readonly classes = computed(() => {
    const base = "relative w-full rounded-lg border p-4 font-sans text-sm";

    const variants = {
      default:
        "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)]",
      destructive:
        "bg-[var(--destructive)]/10 text-[var(--foreground)] border-[var(--destructive)]/40",
      info: "bg-[var(--info)]/10 text-[var(--foreground)] border-[var(--info)]/40",
      success:
        "bg-[var(--success)]/10 text-[var(--foreground)] border-[var(--success)]/40",
      warning:
        "bg-[var(--warning)]/10 text-[var(--foreground)] border-[var(--warning)]/40",
    } satisfies Record<AlertVariant, string>;

    return `${base} ${variants[this.variant()]}`;
  });
}
