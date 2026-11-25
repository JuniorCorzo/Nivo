import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  selector: "app-active-ticket-entry-time-cell",
  standalone: true,
  template: `
    <div class="text-foreground font-mono text-xs tabular-nums">
      {{ entryTime() | date: "dd/MM/yyyy HH:mm" }}
    </div>
  `,
})
export class ActiveTicketEntryTimeCellComponent {
  readonly entryTime = input<string | undefined>();
}
