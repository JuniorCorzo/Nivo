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
      <div
        class="inline-flex flex-col items-center rounded-md border border-zinc-950 bg-amber-400 px-2.5 py-0.5 font-mono leading-none font-extrabold text-zinc-950 shadow-xs select-none"
      >
        <span
          class="text-[8px] font-bold tracking-widest text-zinc-800/80 uppercase"
          >COLOMBIA</span
        >
        <span class="text-xs font-black tracking-wider">{{ plate() }}</span>
      </div>
    }
  `,
})
export class TicketPlateCellComponent {
  readonly plate = input.required<string>();

  readonly isUnplated = computed(
    () => this.plate()?.startsWith("SP-") ?? false
  );
}
