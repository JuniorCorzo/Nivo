import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

type AlertVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info';

@Component({
  selector: 'nv-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes()" role="alert">
      @if (icon()) {
        <span class="mr-2">{{ icon() }}</span>
      }
      @if (title()) {
        <h4 class="mb-1 font-semibold leading-none tracking-tight font-sans">{{ title() }}</h4>
      }
      <ng-content />
    </div>
  `,
})
export class AlertComponent {
  readonly variant = input<AlertVariant>('default');
  readonly title = input<string | undefined>(undefined);
  readonly icon = input<string | undefined>(undefined);

  readonly classes = computed(() => {
    const base =
      'relative w-full rounded-lg border p-4 font-sans text-sm';

    const variants: Record<AlertVariant, string> = {
      default:
        'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)]',
      success:
        'bg-[var(--success)]/10 text-[var(--foreground)] border-[var(--success)]/40',
      warning:
        'bg-[var(--warning)]/10 text-[var(--foreground)] border-[var(--warning)]/40',
      destructive:
        'bg-[var(--destructive)]/10 text-[var(--foreground)] border-[var(--destructive)]/40',
      info: 'bg-[var(--info)]/10 text-[var(--foreground)] border-[var(--info)]/40',
    };

    return `${base} ${variants[this.variant()]}`;
  });
}
