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
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, convertToParamMap, RouterLink } from "@angular/router";
import type { VehicleType } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBike,
  lucideCamera,
  lucideCar,
  lucideClock,
  lucideCoins,
  lucideGauge,
  lucideLogIn,
  lucideLogOut,
  lucideParkingSquare,
  lucidePlus,
  lucideQrCode,
  lucideSearch,
  lucideTicket,
  lucideX,
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
import { PlateMaskDirective } from "@shared/directives/plate-mask";
import { of } from "rxjs";

import { CheckInModalComponent } from "../components/modals/check-in-modal/check-in-modal";
import { CheckOutModalComponent } from "../components/modals/check-out-modal/check-out-modal";
import { QrScannerModalComponent } from "../components/modals/qr-scanner-modal/qr-scanner-modal";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIcon,
    BadgeComponent,
    ButtonComponent,
    DividerComponent,
    PageHeaderComponent,
    PlateMaskDirective,
    CheckInModalComponent,
    CheckOutModalComponent,
    QrScannerModalComponent,
  ],
  providers: [
    provideIcons({
      lucideBike,
      lucideCamera,
      lucideCar,
      lucideClock,
      lucideCoins,
      lucideGauge,
      lucideLogIn,
      lucideLogOut,
      lucideParkingSquare,
      lucidePlus,
      lucideQrCode,
      lucideSearch,
      lucideTicket,
      lucideX,
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
  readonly selectedCheckInSlot = signal<SlotSummary | null>(null);
  readonly checkInModalInitialUnplated = signal<boolean>(false);
  readonly isCheckOutModalOpen = signal<boolean>(false);
  readonly selectedCheckoutTicket = signal<TicketSummary | null>(null);

  readonly expressPlate = signal<string>("");
  readonly expressVehicleType = signal<VehicleType>("CAR");
  readonly isSubmittingExpressCheckIn = signal<boolean>(false);
  readonly isQrScannerOpen = signal<boolean>(false);

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
      this.slots().filter((s) => s.status === "AVAILABLE" && s.type === "CAR")
        .length
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

  readonly occupationBarPercentage = computed(() =>
    Math.min(this.occupationPercentage(), 100)
  );

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

  private pendingCheckoutTicketId: string | null = null;

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
            const openTickets = (tickets ?? []).filter(
              (t) => t.status === "OPEN"
            );
            this.activeTickets.set(openTickets);
            this.tryProcessPendingCheckout(openTickets);
          },
        });
      } else {
        this.activeTickets.set([]);
      }
    });

    (this.route.queryParamMap ?? of(convertToParamMap({})))
      .pipe(takeUntilDestroyed())
      .subscribe((queryParams) => {
        const checkoutTicketId = queryParams.get("checkoutTicketId");
        if (checkoutTicketId) {
          this.pendingCheckoutTicketId = checkoutTicketId;
          this.tryProcessPendingCheckout(this.activeTickets());
        } else {
          this.pendingCheckoutTicketId = null;
        }
      });
  }

  private tryProcessPendingCheckout(
    tickets: TicketSummary[] = this.activeTickets()
  ): void {
    if (!this.pendingCheckoutTicketId) {
      return;
    }
    const match = tickets.find((t) => t.id === this.pendingCheckoutTicketId);
    if (match) {
      this.pendingCheckoutTicketId = null;
      this.checkOutWithTicket(match);
    }
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
        const openTickets = (tickets ?? []).filter((t) => t.status === "OPEN");
        this.activeTickets.set(openTickets);
        this.tryProcessPendingCheckout(openTickets);
      },
    });
  }

  setVehicleFilter(val: string): void {
    this.vehicleFilter.set(val);
  }

  setStatusFilter(val: string): void {
    this.statusFilter.set(val);
  }

  resetSlotFilters(): void {
    this.vehicleFilter.set("ALL");
    this.statusFilter.set("ALL");
  }

  setSearchTicketQuery(query: string): void {
    this.searchTicketQuery.set(query);
  }

  onSearchQueryChange(event: Event): void {
    /* SAFETY: event.target is HTMLInputElement from input element */
    const input = event.target as HTMLInputElement;
    this.searchTicketQuery.set(input?.value ?? "");
  }

  onSlotClick(slot: SlotSummary): void {
    if (slot.status === "AVAILABLE") {
      this.checkInSpecificSlot(slot);
    } else if (slot.status === "OCCUPIED") {
      this.checkOutSpecificSlot(slot);
    }
  }

  getActiveTicketForSlot(slot: SlotSummary): TicketSummary | undefined {
    return this.activeTickets().find(
      (t) =>
        (t.slotId && t.slotId === slot.id) ||
        (t.slotNumber && t.slotNumber === slot.slotNumber)
    );
  }

  openCheckInModal(unplated = false): void {
    this.selectedCheckInSlot.set(null);
    this.checkInModalInitialUnplated.set(unplated);
    this.isCheckInModalOpen.set(true);
  }

  closeCheckInModal(): void {
    this.isCheckInModalOpen.set(false);
    this.selectedCheckInSlot.set(null);
    this.checkInModalInitialUnplated.set(false);
    this.refreshActiveTickets();
  }

  checkInSpecificSlot(slot: SlotSummary): void {
    this.selectedCheckInSlot.set(slot);
    this.checkInModalInitialUnplated.set(false);
    this.isCheckInModalOpen.set(true);
  }

  submitExpressCheckOutByQuery(queryOverride?: string): void {
    const rawQuery = queryOverride ?? this.searchTicketQuery();
    const query = rawQuery.trim().toLowerCase();
    if (!query) {
      this.openDirectCheckOutModal();
      return;
    }

    const normQuery = query.replaceAll(/[^a-z0-9]/giu, "").toLowerCase();

    const matches = this.activeTickets().filter((t) => {
      const plate = (t.licensePlate ?? "").toLowerCase();
      const slot = (t.slotNumber ?? "").toLowerCase();
      const normPlate = plate.replaceAll(/[^a-z0-9]/giu, "");
      const normSlot = slot.replaceAll(/[^a-z0-9]/giu, "");
      return (
        plate.includes(query) ||
        slot.includes(query) ||
        (normQuery.length >= 2 &&
          (normPlate.includes(normQuery) || normSlot.includes(normQuery)))
      );
    });

    if (matches.length === 1) {
      this.checkOutWithTicket(matches[0]);
      return;
    }

    const exact = matches.find((t) => {
      const plate = (t.licensePlate ?? "").toLowerCase();
      const slot = (t.slotNumber ?? "").toLowerCase();
      const normPlate = plate.replaceAll(/[^a-z0-9]/giu, "");
      const normSlot = slot.replaceAll(/[^a-z0-9]/giu, "");
      return (
        plate === query ||
        slot === query ||
        (normQuery.length >= 3 &&
          (normPlate === normQuery || normSlot === normQuery))
      );
    });
    if (exact) {
      this.checkOutWithTicket(exact);
      return;
    }

    if (matches.length > 1) {
      this.toast.showToast({
        message: "Múltiples vehículos coinciden. Selecciona uno de la lista.",
        type: "warning",
      });
      return;
    }

    this.toast.showToast({
      message: "No se encontró ningún vehículo activo con ese criterio.",
      type: "error",
    });
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

  openQrScanner(): void {
    this.isQrScannerOpen.set(true);
  }

  closeQrScanner(): void {
    this.isQrScannerOpen.set(false);
  }

  onQrScanned(data: { plate: string; vehicleType?: VehicleType }): void {
    this.closeQrScanner();
    this.searchTicketQuery.set(data.plate);
    this.submitExpressCheckOutByQuery(data.plate);
  }

  setExpressVehicleType(type: VehicleType): void {
    this.expressVehicleType.set(type);
  }

  submitExpressCheckIn(
    plateOverride?: string,
    typeOverride?: VehicleType
  ): void {
    if (this.isSubmittingExpressCheckIn()) {
      return;
    }
    const rawPlate = plateOverride ?? this.expressPlate();
    const cleanPlate = (rawPlate ?? "")
      .replaceAll(/[^a-zA-Z0-9]/gu, "")
      .toUpperCase();

    if (cleanPlate.length < 3) {
      this.toast.showToast({
        message: "Por favor ingresa una placa válida (mínimo 3 caracteres).",
        type: "error",
      });
      return;
    }

    const targetType = typeOverride ?? this.expressVehicleType();
    const availableSlot = this.slots().find(
      (s) => s.status === "AVAILABLE" && s.type === targetType
    );

    if (!availableSlot) {
      this.toast.showToast({
        message: `No hay cupos disponibles para ${targetType === "CAR" ? "carros" : "motos"}.`,
        type: "error",
      });
      return;
    }

    const activeRate = this.rates().find((r) => r.vehicleType === targetType);

    if (!activeRate) {
      this.toast.showToast({
        message: "No se encontró una tarifa activa para este vehículo.",
        type: "error",
      });
      return;
    }

    this.isSubmittingExpressCheckIn.set(true);
    this.ticketService
      .createTicket({
        plate: cleanPlate,
        rateId: activeRate.id,
        slotId: availableSlot.id,
      })
      .subscribe({
        error: (err) => {
          this.isSubmittingExpressCheckIn.set(false);
          const msg =
            err?.error?.message || "Error al registrar ingreso express.";
          this.toast.showToast({ message: msg, type: "error" });
        },
        next: (ticket) => {
          this.isSubmittingExpressCheckIn.set(false);
          this.expressPlate.set("");
          const slotNum =
            availableSlot.slotNumber || ticket.slotNumber || "asignada";
          this.toast.showToast({
            message: `¡Ingreso registrado! Placa ${ticket.licensePlate || cleanPlate} en bahía #${slotNum}.`,
            type: "success",
          });
          this.refreshActiveTickets();
        },
      });
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (
      this.isCheckInModalOpen() ||
      this.isCheckOutModalOpen() ||
      this.isQrScannerOpen()
    ) {
      return;
    }

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
    } else if (event.key === "q" || event.key === "Q") {
      event.preventDefault();
      this.openQrScanner();
    }
  }
}
