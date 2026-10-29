import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMapPin } from "@ng-icons/lucide";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [provideIcons({ lucideMapPin })],
  selector: "app-ticket-parking-badge",
  standalone: true,
  template: `
    <div
      class="text-foreground inline-flex max-w-[170px] items-center gap-1.5 text-xs font-medium"
      [title]="name() || '—'"
    >
      <ng-icon
        name="lucideMapPin"
        class="text-muted-foreground shrink-0"
        size="13"
      />
      <span class="truncate">{{ name() || "—" }}</span>
    </div>
  `,
})
export class TicketParkingBadgeComponent {
  readonly name = input<string | undefined>();
}
