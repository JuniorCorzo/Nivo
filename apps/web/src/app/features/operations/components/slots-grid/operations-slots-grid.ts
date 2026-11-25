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
  lucideLogOut,
  lucideParkingSquare,
  lucidePlus,
} from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, NgIcon],
  providers: [
    provideIcons({
      lucideBike,
      lucideCar,
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
        const key = ticket.slotNumber.includes("-")
          ? ticket.slotNumber
          : `num-${ticket.slotNumber}`;
        if (!map.has(key)) {
          map.set(key, ticket);
        }
      }
    }
    return map;
  });

  getActiveTicketForSlot(slot: SlotSummary): TicketSummary | undefined {
    const map = this.activeTicketsMap();
    const byId = map.get(slot.id);
    if (byId) {
      return byId;
    }
    if (slot.prefix && slot.slotNumber) {
      return map.get(`${slot.prefix}-${slot.slotNumber}`);
    }
    return slot.slotNumber ? map.get(`num-${slot.slotNumber}`) : undefined;
  }

  getSlotAriaLabel(slot: SlotSummary): string {
    const label = `${slot.prefix ? `${slot.prefix}-` : ""}${slot.slotNumber}`;
    if (slot.status === "AVAILABLE") {
      return this.texts.slotAriaAvailable(label, slot.type);
    }
    if (slot.status === "OCCUPIED") {
      return this.texts.slotAriaOccupied(label);
    }
    return this.texts.slotAriaStatus(label, slot.status);
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
