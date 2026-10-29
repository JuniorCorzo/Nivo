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
        class="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 font-mono text-xs font-bold text-amber-400 tabular-nums"
      >
        <ng-icon name="lucideCamera" size="13" />
        <span>{{ plate() }}</span>
      </span>
    } @else {
      <span
        class="inline-flex items-center gap-1.5 rounded border border-zinc-700 bg-amber-400 px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-zinc-950 uppercase tabular-nums shadow-xs"
      >
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
