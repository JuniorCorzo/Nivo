import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-ticket-plate-cell",
  standalone: true,
  template: `
    <span class="text-foreground font-mono font-bold">{{ plate() }}</span>
  `,
})
export class TicketPlateCellComponent {
  readonly plate = input.required<string>();
}
