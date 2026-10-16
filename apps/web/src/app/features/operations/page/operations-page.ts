import { CommonModule } from "@angular/common";
import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBike,
  lucideCar,
  lucideCoins,
  lucideGauge,
  lucideLogIn,
  lucideLogOut,
  lucideParkingSquare,
  lucideSearch,
  lucideTicket,
} from "@ng-icons/lucide";
import {
  BadgeComponent,
  ButtonComponent,
  DividerComponent,
  ToastService,
} from "@nivo-sass/design-system";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { CheckInModalComponent } from "../components/modals/check-in-modal/check-in-modal";
import { CheckOutModalComponent } from "../components/modals/check-out-modal/check-out-modal";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    BadgeComponent,
    ButtonComponent,
    DividerComponent,
    PageHeaderComponent,
    CheckInModalComponent,
    CheckOutModalComponent,
  ],
  providers: [
    provideIcons({
      lucideBike,
      lucideCar,
      lucideCoins,
      lucideGauge,
      lucideLogIn,
      lucideLogOut,
      lucideParkingSquare,
      lucideSearch,
      lucideTicket,
    }),
  ],
  selector: "app-operations-page",
  standalone: true,
  styleUrl: "./operations-page.css",
  templateUrl: "./operations-page.html",
})
export class OperationsPageComponent {
  readonly APP_ROUTES = APP_ROUTES;
  readonly ticketTexts = APP_TEXTS.tickets.actions;

  private readonly route = inject(ActivatedRoute);
  private readonly parkingService = inject(ParkingService);
  private readonly slotService = inject(SlotService);
  private readonly rateService = inject(RateService);
  private readonly ticketService = inject(TicketService);
  private readonly toast = inject(ToastService);

  readonly parkingId = signal<string | null>(null);

  readonly isCheckInModalOpen = signal<boolean>(false);
  readonly isCheckOutModalOpen = signal<boolean>(false);
  readonly selectedCheckoutTicket = signal<TicketSummary | null>(null);

  readonly activeTickets = signal<TicketSummary[]>([]);
  readonly searchTicketQuery = signal<string>("");

  readonly vehicleFilter = signal<string>("ALL");
  readonly statusFilter = signal<string>("ALL");

  readonly parking = computed(() => {
    const id = this.parkingId();
    if (!id) {
      return null;
    }
    return (
      (this.parkingService.parkingLots() ?? []).find((lot) => lot.id === id) ??
      null
    );
  });

  readonly slots = computed<SlotSummary[]>(() => {
    const id = this.parkingId();
    if (!id) {
      return [];
    }
    return this.slotService.summaries()[id] ?? [];
  });

  readonly rates = computed(() => {
    const id = this.parkingId();
    if (!id) {
      return [];
    }
    return this.rateService.ratesByParking()[id] ?? [];
  });

  readonly totalSlotsCount = computed(() => this.slots().length);

  readonly availableSlotsCount = computed(
    () => this.slots().filter((s) => s.status === "AVAILABLE").length
  );

  readonly availableCarSlotsCount = computed(
    () =>
      this.slots().filter(
        (s) => s.status === "AVAILABLE" && s.type === "CAR"
      ).length
  );

  readonly totalCarSlotsCount = computed(
    () => this.slots().filter((s) => s.type === "CAR").length
  );

  readonly availableMotoSlotsCount = computed(
    () =>
      this.slots().filter(
        (s) => s.status === "AVAILABLE" && s.type === "MOTORCYCLE"
      ).length
  );

  readonly totalMotoSlotsCount = computed(
    () => this.slots().filter((s) => s.type === "MOTORCYCLE").length
  );

  readonly occupiedSlotsCount = computed(
    () => this.slots().filter((s) => s.status === "OCCUPIED").length
  );

  readonly ratesCount = computed(() => this.rates().length);

  readonly occupationPercentage = computed(() => {
    const total = this.totalSlotsCount();
    if (total === 0) {
      return 0;
    }
    return Math.round((this.occupiedSlotsCount() / total) * 100);
  });

  readonly filteredSlots = computed(() => {
    let list = this.slots();
    const vFilter = this.vehicleFilter();
    const sFilter = this.statusFilter();

    if (vFilter !== "ALL") {
      list = list.filter((s) => s.type === vFilter);
    }

    if (sFilter !== "ALL") {
      list = list.filter((s) => s.status === sFilter);
    }

    return list;
  });

  readonly filteredActiveTickets = computed(() => {
    const tickets = this.activeTickets();
    const query = this.searchTicketQuery().trim().toLowerCase();
    if (!query) {
      return tickets;
    }
    return tickets.filter((t) => {
      const plate = (t.licensePlate ?? "").toLowerCase();
      const slot = (t.slotNumber ?? "").toLowerCase();
      return plate.includes(query) || slot.includes(query);
    });
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get("parkingId");
      this.parkingId.set(id);
      if (id) {
        this.slotService.getAllSlotSummariesByParkingId(id).subscribe();
        this.rateService.getRatesByParkingId(id).subscribe();
        this.ticketService.listTicketsByParkingLot(id).subscribe({
          error: () => this.activeTickets.set([]),
          next: (tickets) => {
            this.activeTickets.set(
              (tickets ?? []).filter((t) => t.status === "OPEN")
            );
          },
        });
      } else {
        this.activeTickets.set([]);
      }
    });
  }

  refreshActiveTickets(): void {
    const id = this.parkingId();
    if (!id) {
      return;
    }
    this.slotService.getAllSlotSummariesByParkingId(id).subscribe();
    this.ticketService.listTicketsByParkingLot(id).subscribe({
      error: () => this.activeTickets.set([]),
      next: (tickets) => {
        this.activeTickets.set(
          (tickets ?? []).filter((t) => t.status === "OPEN")
        );
      },
    });
  }

  setVehicleFilter(val: string): void {
    this.vehicleFilter.set(val);
  }

  setStatusFilter(val: string): void {
    this.statusFilter.set(val);
  }

  setSearchTicketQuery(query: string): void {
    this.searchTicketQuery.set(query);
  }

  onSearchQueryChange(event: Event): void {
    /* SAFETY: event.target is HTMLInputElement from input element */
    const input = event.target as HTMLInputElement;
    this.searchTicketQuery.set(input?.value ?? "");
  }

  openCheckInModal(): void {
    this.isCheckInModalOpen.set(true);
  }

  closeCheckInModal(): void {
    this.isCheckInModalOpen.set(false);
    this.refreshActiveTickets();
  }

  checkInSpecificSlot(_slot: SlotSummary): void {
    this.isCheckInModalOpen.set(true);
  }

  openDirectCheckOutModal(): void {
    this.selectedCheckoutTicket.set(null);
    this.isCheckOutModalOpen.set(true);
  }

  checkOutWithTicket(ticket: TicketSummary): void {
    this.selectedCheckoutTicket.set(ticket);
    this.isCheckOutModalOpen.set(true);
  }

  checkOutSpecificSlot(slot: SlotSummary): void {
    this.ticketService.getActiveTicketBySlot(slot.id).subscribe({
      error: (err) => {
        const msg =
          err?.error?.message ||
          "No se encontró un ticket activo para este cupo.";
        this.toast.showToast({ message: msg, type: "error" });
      },
      next: (ticket) => {
        this.selectedCheckoutTicket.set(ticket);
        this.isCheckOutModalOpen.set(true);
      },
    });
  }

  closeCheckOutModal(): void {
    this.isCheckOutModalOpen.set(false);
    this.selectedCheckoutTicket.set(null);
    this.refreshActiveTickets();
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    /* SAFETY: event.target is HTMLElement or null on window keyboard event */
    const target = event.target as HTMLElement | null;
    const tagName = target?.tagName?.toUpperCase();
    if (
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      tagName === "SELECT" ||
      target?.isContentEditable
    ) {
      return;
    }

    if (event.key === "i" || event.key === "I") {
      event.preventDefault();
      this.openCheckInModal();
    } else if (event.key === "o" || event.key === "O") {
      event.preventDefault();
      this.openDirectCheckOutModal();
    }
  }
}
