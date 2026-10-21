import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import type { ParkingSlotStatus } from "@core/type/parking-slot.type";
import { BadgeComponent } from "@nivo-sass/design-system";

import {
  SLOT_STATUS_LABELS,
  SLOT_STATUS_VARIANTS,
} from "../../../shared/parking-slot-presentations";

export const isParkingSlotStatus = (status: string): status is ParkingSlotStatus =>
  status in SLOT_STATUS_LABELS;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  selector: "app-slot-status-badge",
  standalone: true,
  templateUrl: "./slot-status-badge.html",
})
export class SlotStatusBadgeComponent {
  readonly status = input.required<string>();
  readonly isActive = input<boolean>(true);

  readonly label = computed(() => {
    if (!this.isActive()) {
      return "Inactiva";
    }
    const s = this.status();
    return isParkingSlotStatus(s) ? SLOT_STATUS_LABELS[s] : s;
  });

  readonly variant = computed(() => {
    if (!this.isActive()) {
      return "warning";
    }
    const s = this.status();
    return isParkingSlotStatus(s) ? SLOT_STATUS_VARIANTS[s] : "secondary";
  });
}
