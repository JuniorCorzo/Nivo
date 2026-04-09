import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'nv-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="wrapperClasses()">
      @if (src()) {
        <img
          [src]="src()"
          [alt]="alt() || ''"
          loading="lazy"
          decoding="async"
          class="w-full h-full rounded-full object-cover border border-[var(--border)] bg-[var(--muted)]"
        />
      } @else {
        <div
          class="w-full h-full rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] font-semibold font-sans select-none"
        >
          {{ initials() }}
        </div>
      }
    </div>
  `,
})
export class AvatarComponent {
  readonly src = input<string | undefined>(undefined);
  readonly alt = input<string | undefined>(undefined);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly name = input<string | undefined>(undefined);

  readonly initials = computed(() => {
    const n = this.name();
    if (!n) return '•';
    const words = n.trim().split(/\s+/);
    return words
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  });

  readonly wrapperClasses = computed(() => {
    const base = 'inline-flex shrink-0 overflow-hidden rounded-full border border-[var(--border)]';

    const sizes: Record<string, string> = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
    };

    return `${base} ${sizes[this.size()]}`;
  });
}
