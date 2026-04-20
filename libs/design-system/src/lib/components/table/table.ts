import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'table[nv-table]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': 'classes()',
  },
})
export class TableComponent {
  readonly class = input<string>('');
  readonly classes = computed(() => {
    const base = 'w-full caption-bottom text-sm text-[var(--foreground)]';
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
