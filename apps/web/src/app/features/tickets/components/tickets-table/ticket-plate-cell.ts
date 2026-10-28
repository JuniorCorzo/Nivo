import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCamera } from "@ng-icons/lucide";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideCamera,
    }),
  ],
  selector: "app-ticket-plate-cell",
  standalone: true,
  template: `
    @if (isUnplated()) {
      <span
        class="inline-flex items-center gap-1 font-mono text-xs font-semibold text-amber-500 dark:text-amber-400"
      >
        <ng-icon name="lucideCamera" size="13" />
        <span>{{ plate() }}</span>
      </span>
    } @else {
      <span class="text-foreground font-mono text-sm font-bold tracking-wider">
        {{ plate() }}
      </span>
    }
  `,
})
export class TicketPlateCellComponent {
  readonly plate = input.required<string>();

  readonly isUnplated = computed(
    () => this.plate()?.startsWith("SP-") ?? false
  );
}
