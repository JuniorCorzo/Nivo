import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBike,
  lucideCar,
  lucideClock,
  lucideLogOut,
  lucideParkingSquare,
  lucidePlus,
} from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucideBike,
      lucideCar,
      lucideClock,
      lucideLogOut,
      lucideParkingSquare,
      lucidePlus,
    }),
  ],
  selector: "app-operations-slots-grid",
  standalone: true,
  templateUrl: "./operations-slots-grid.html",
})
export class OperationsSlotsGridComponent {
  readonly texts = APP_TEXTS.operations.slotsGrid;

  readonly filteredSlots = input.required<SlotSummary[]>();
  readonly vehicleFilter = input<string>("ALL");
  readonly statusFilter = input<string>("ALL");
  readonly activeTickets = input<TicketSummary[]>([]);

  readonly vehicleFilterChange = output<string>();
  readonly statusFilterChange = output<string>();
  readonly resetFilters = output();
  readonly slotClick = output<SlotSummary>();

  readonly activeTicketsMap = computed(() => {
    const map = new Map<string, TicketSummary>();
    for (const ticket of this.activeTickets()) {
      if (ticket.slotId) {
        map.set(ticket.slotId, ticket);
      }
      if (ticket.slotNumber) {
        map.set(`num-${ticket.slotNumber}`, ticket);
      }
    }
    return map;
  });

  getActiveTicketForSlot(slot: SlotSummary): TicketSummary | undefined {
    const map = this.activeTicketsMap();
    return (
      map.get(slot.id) ??
      (slot.slotNumber ? map.get(`num-${slot.slotNumber}`) : undefined)
    );
  }

  onSlotClick(slot: SlotSummary): void {
    this.slotClick.emit(slot);
  }

  onVehicleFilterSelect(filter: string): void {
    this.vehicleFilterChange.emit(filter);
  }

  onStatusFilterSelect(filter: string): void {
    this.statusFilterChange.emit(filter);
  }

  onResetFilters(): void {
    this.resetFilters.emit();
  }
}
