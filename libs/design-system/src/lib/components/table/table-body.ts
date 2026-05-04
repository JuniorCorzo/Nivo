import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'tbody[nv-table-body]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': 'classes()',
  },
})
export class TableBodyComponent {
  readonly class = input<string>('');
  readonly classes = computed(() => {
    const base = '[&_tr:last-child]:border-0';
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
