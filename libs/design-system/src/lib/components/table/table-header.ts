import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'thead[nv-table-header]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': 'classes()',
  },
})
export class TableHeaderComponent {
  readonly class = input<string>('');
  readonly classes = computed(() => {
    const base = '[&_tr]:border-b';
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
