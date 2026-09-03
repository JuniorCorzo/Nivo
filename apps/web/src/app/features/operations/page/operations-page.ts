import { CommonModule } from "@angular/common";
import {
  Component,
  ChangeDetectionStrategy,
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
  lucideArrowLeft,
  lucideCar,
  lucideCoins,
  lucideGauge,
  lucideLogIn,
  lucideLogOut,
  lucideParkingSquare,
} from "@ng-icons/lucide";
import { ButtonComponent, ToastService } from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { CheckInModalComponent } from "../components/check-in-modal/check-in-modal.component";
import { CheckOutModalComponent } from "../components/check-out-modal/check-out-modal.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    ButtonComponent,
    CheckInModalComponent,
    CheckOutModalComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCar,
      lucideCoins,
      lucideGauge,
      lucideLogIn,
      lucideLogOut,
      lucideParkingSquare,
    }),
  ],
  selector: "app-operations-page",
  standalone: true,
  styleUrl: "./operations-page.css",
  templateUrl: "./operations-page.html",
})
export class OperationsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly parkingService = inject(ParkingService);
  private readonly slotService = inject(SlotService);
  private readonly rateService = inject(RateService);
  private readonly ticketService = inject(TicketService);
  private readonly toast = inject(ToastService);

  readonly APP_ROUTES = APP_ROUTES;
  readonly parkingId = signal<string | null>(null);

  readonly isCheckInModalOpen = signal<boolean>(false);
  readonly isCheckOutModalOpen = signal<boolean>(false);
  readonly selectedCheckoutTicket = signal<TicketSummary | null>(null);

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

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get("parkingId");
      this.parkingId.set(id);
      if (id) {
        this.slotService.getAllSlotSummariesByParkingId(id).subscribe();
        this.rateService.getRatesByParkingId(id).subscribe();
      }
    });
  }

  setVehicleFilter(val: string): void {
    this.vehicleFilter.set(val);
  }

  setStatusFilter(val: string): void {
    this.statusFilter.set(val);
  }

  openCheckInModal(): void {
    this.isCheckInModalOpen.set(true);
  }

  closeCheckInModal(): void {
    this.isCheckInModalOpen.set(false);
  }

  checkInSpecificSlot(_slot: SlotSummary): void {
    this.isCheckInModalOpen.set(true);
  }

  openDirectCheckOutModal(): void {
    this.selectedCheckoutTicket.set(null);
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
  }
}
