import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import type {
  OperationsFilterOption,
  OperationsSlotsFilterAction,
  OperationsSlotsGridFilters,
} from "@core/models/operations-cockpit.model";
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

  readonly filterGroupClass =
    "border-border bg-muted flex shrink-0 rounded-lg border p-0.5 text-xs";
  readonly plateBadgeClass =
    "border-info/30 bg-info/20 text-info mt-1 block max-w-[120px] truncate rounded border px-1.5 py-0.5 font-mono text-xs font-bold tracking-wider tabular-nums";
  readonly occupiedBadgeClass =
    "border-info/30 bg-info/20 text-info mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase";

  readonly filteredSlots = input.required<SlotSummary[]>();
  readonly filters = input<OperationsSlotsGridFilters>({
    statusFilter: "ALL",
    vehicleFilter: "ALL",
  });
  readonly activeTickets = input<TicketSummary[]>([]);

  readonly filterAction = output<OperationsSlotsFilterAction>();
  readonly slotClick = output<SlotSummary>();

  readonly vehicleOptions: readonly OperationsFilterOption[] = [
    {
      activeClass: "text-foreground",
      label: this.texts.filterAll,
      value: "ALL",
    },
    {
      activeClass: "text-foreground",
      label: this.texts.filterCars,
      value: "CAR",
    },
    {
      activeClass: "text-foreground",
      label: this.texts.filterMotos,
      value: "MOTORCYCLE",
    },
  ];

  readonly statusOptions: readonly OperationsFilterOption[] = [
    {
      activeClass: "text-foreground",
      label: this.texts.filterAll,
      value: "ALL",
    },
    {
      activeClass: "text-success",
      label: this.texts.filterAvailable,
      value: "AVAILABLE",
    },
    {
      activeClass: "text-info",
      label: this.texts.filterOccupied,
      value: "OCCUPIED",
    },
  ];

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

  getFilterBtnClass(option: OperationsFilterOption, current: string): string {
    const stateClass =
      option.value === current
        ? `bg-card ${option.activeClass} shadow-xs`
        : "text-muted-foreground";
    return `h-auto rounded-md px-2.5 py-1 text-xs ${stateClass}`;
  }

  getSlotCardClass(slot: SlotSummary): string {
    const base =
      "group focus-visible:ring-primary relative flex flex-col justify-between rounded-xl border p-3 shadow-xs transition-all duration-150 select-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-hidden active:translate-y-0 active:scale-[0.98]";
    if (slot.status === "AVAILABLE") {
      return `${base} border-success/30 bg-success/10 hover:border-success hover:bg-success/15 cursor-pointer`;
    }
    if (slot.status === "OCCUPIED") {
      return `${base} border-info/30 bg-info/10 hover:border-info hover:bg-info/15 cursor-pointer`;
    }
    return `${base} border-border bg-muted/40 cursor-not-allowed opacity-60`;
  }

  getSlotDotClass(slot: SlotSummary): string {
    if (slot.status === "AVAILABLE") {
      return "inline-block h-2.5 w-2.5 rounded-full bg-success ring-2 ring-success/20";
    }
    if (slot.status === "OCCUPIED") {
      return "inline-block h-2.5 w-2.5 rounded-full bg-info ring-2 ring-info/20";
    }
    return "inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground";
  }

  getSlotFooterClass(slot: SlotSummary): string {
    const base =
      "flex items-center justify-center gap-1 rounded-lg border py-1.5 text-center text-[11px] font-bold transition-colors";
    if (slot.status === "AVAILABLE") {
      return `${base} border-success/30 bg-success/20 text-success group-hover:bg-success group-hover:text-primary-foreground`;
    }
    if (slot.status === "OCCUPIED") {
      return `${base} border-info/30 bg-info/20 text-info group-hover:bg-info group-hover:text-primary-foreground`;
    }
    return "border-border bg-muted/60 text-muted-foreground rounded-lg border py-1.5 text-center text-[11px] font-semibold uppercase";
  }

  onSlotClick(slot: SlotSummary): void {
    this.slotClick.emit(slot);
  }

  onVehicleFilterSelect(value: string): void {
    this.filterAction.emit({ type: "vehicle", value });
  }

  onStatusFilterSelect(value: string): void {
    this.filterAction.emit({ type: "status", value });
  }

  onResetFilters(): void {
    this.filterAction.emit({ type: "reset" });
  }
}
