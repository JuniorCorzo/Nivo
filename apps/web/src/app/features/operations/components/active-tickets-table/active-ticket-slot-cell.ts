import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-active-ticket-slot-cell",
  standalone: true,
  template: `
    <div class="text-foreground font-medium tabular-nums">
      {{ slotLabel() }}
    </div>
    @if (slotType()) {
      <span class="text-muted-foreground text-[10px] uppercase">
        {{ slotType() }}
      </span>
    }
  `,
})
export class ActiveTicketSlotCellComponent {
  readonly texts = APP_TEXTS.operations.activeTickets;

  readonly slotNumber = input<string | undefined>();
  readonly slotType = input<string | undefined>();

  readonly slotLabel = computed(() => {
    const number = this.slotNumber();
    return number
      ? `${this.texts.slotPrefix} ${number}`
      : this.texts.emptySlotPlaceholder;
  });
}
