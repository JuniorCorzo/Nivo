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
import { ActivatedRoute, RouterLink } from "@angular/router";
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
  lucideCar,
  lucideCoins,
  lucideGauge,
  lucideLogIn,
  lucideLogOut,
  lucideParkingSquare,
  lucideQrCode,
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
import { PlateMaskDirective } from "@shared/directives/plate-mask";

import { CheckInModalComponent } from "../components/modals/check-in-modal/check-in-modal";
import { CheckOutModalComponent } from "../components/modals/check-out-modal/check-out-modal";
import {
  QrScannerModalComponent,
  type ScannedQrData,
} from "../components/modals/qr-scanner-modal/qr-scanner-modal";

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
      lucideCar,
      lucideCoins,
      lucideGauge,
      lucideLogIn,
      lucideLogOut,
      lucideParkingSquare,
      lucideQrCode,
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
  readonly selectedCheckInSlot = signal<SlotSummary | null>(null);
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

  openCheckInModal(): void {
    this.selectedCheckInSlot.set(null);
    this.isCheckInModalOpen.set(true);
  }

  closeCheckInModal(): void {
    this.isCheckInModalOpen.set(false);
    this.selectedCheckInSlot.set(null);
    this.refreshActiveTickets();
  }

  checkInSpecificSlot(slot: SlotSummary): void {
    this.selectedCheckInSlot.set(slot);
    this.isCheckInModalOpen.set(true);
  }

  submitExpressCheckOutByQuery(): void {
    const query = this.searchTicketQuery().trim().toLowerCase();
    if (!query) {
      this.toast.showToast({
        message: "Ingresa una placa o bahía para cobrar salida.",
        type: "error",
      });
      return;
    }

    const matches = this.filteredActiveTickets();
    if (matches.length === 1) {
      this.checkOutWithTicket(matches[0]);
      return;
    }

    const exact = matches.find(
      (t) =>
        t.licensePlate?.toLowerCase() === query ||
        t.slotNumber?.toLowerCase() === query
    );
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

  onQrScanned(data: ScannedQrData): void {
    this.closeQrScanner();

    if (data.ticketId) {
      const matchById = this.activeTickets().find(
        (t) => t.id === data.ticketId
      );
      if (matchById) {
        this.checkOutWithTicket(matchById);
        return;
      }
    }

    if (data.plate) {
      const cleanScannedPlate = data.plate
        .replaceAll(/[^a-zA-Z0-9]/gu, "")
        .toUpperCase();
      const matchByPlate = this.activeTickets().find((t) => {
        const cleanTicketPlate = (t.licensePlate ?? "")
          .replaceAll(/[^a-zA-Z0-9]/gu, "")
          .toUpperCase();
        return cleanTicketPlate === cleanScannedPlate;
      });
      if (matchByPlate) {
        this.checkOutWithTicket(matchByPlate);
        return;
      }
    }

    const identifier = data.ticketId
      ? `Ticket #${data.ticketId.slice(0, 8)}`
      : data.plate
        ? `Placa ${data.plate}`
        : "Código escaneado";

    this.toast.showToast({
      message: `${identifier} no encontrado en taquilla o ya fue liquidado.`,
      type: "error",
    });
  }

  setExpressVehicleType(type: VehicleType): void {
    this.expressVehicleType.set(type);
  }

  submitExpressCheckIn(
    plateOverride?: string,
    typeOverride?: VehicleType
  ): void {
    const rawPlate = plateOverride ?? this.expressPlate();
    const cleanPlate = (rawPlate ?? "")
      .replaceAll(/[^a-zA-Z0-9]/gu, "")
      .toUpperCase();

    if (!cleanPlate) {
      this.toast.showToast({
        message: "Por favor ingresa una placa válida.",
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
