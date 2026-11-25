import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  linkedSignal,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { ParamMap } from "@angular/router";
import { convertToParamMap } from "@angular/router";
import type {
  OperationsKpiMetrics,
  OperationsOmnibarAction,
  OperationsOmnibarState,
  OperationsSlotsFilterAction,
  OperationsSlotsGridFilters,
} from "@core/models/operations-cockpit.model";
import type { VehicleType } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { normalizeRawPlate } from "@shared/utils/plate.utils";
import type { Observable } from "rxjs";
import { EMPTY, catchError, ignoreElements, merge, of, switchMap } from "rxjs";

import type { ScannedQrData } from "../components/modals/qr-scanner-modal/qr-scanner-modal";

@Injectable()
export class OperationsFacade {
  private readonly texts = APP_TEXTS.operations;
  private readonly parkingService = inject(ParkingService);
  private readonly slotService = inject(SlotService);
  private readonly rateService = inject(RateService);
  private readonly ticketService = inject(TicketService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly parkingId = signal<string | null>(null);
  readonly isCheckInModalOpen = signal<boolean>(false);
  readonly selectedCheckInSlot = signal<SlotSummary | null>(null);
  readonly checkInModalInitialUnplated = signal<boolean>(false);
  readonly checkInModalInitialPlate = signal<string>("");
  readonly isCheckOutModalOpen = signal<boolean>(false);
  readonly selectedCheckoutTicket = signal<TicketSummary | null>(null);
  readonly expressPlate = signal<string>("");
  readonly isQrScannerOpen = signal<boolean>(false);
  readonly activeTickets = signal<TicketSummary[]>([]);
  readonly searchTicketQuery = signal<string>("");
  readonly vehicleFilter = signal<string>("ALL");
  readonly statusFilter = signal<string>("ALL");

  private pendingCheckoutTicketId: string | null = null;

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
    return id ? (this.slotService.summaries()[id] ?? []) : [];
  });

  readonly rates = computed(() => {
    const id = this.parkingId();
    return id ? (this.rateService.ratesByParking()[id] ?? []) : [];
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

  readonly configuredVehicleTypes = computed<VehicleType[]>(() => {
    const types = new Set<VehicleType>();
    for (const slot of this.slots()) {
      if (
        slot.type === "CAR" ||
        slot.type === "MOTORCYCLE" ||
        slot.type === "BIKE"
      ) {
        types.add(slot.type);
      }
    }
    for (const rate of this.rates()) {
      if (
        rate.vehicleType === "CAR" ||
        rate.vehicleType === "MOTORCYCLE" ||
        rate.vehicleType === "BIKE"
      ) {
        types.add(rate.vehicleType);
      }
    }
    return [...types];
  });

  readonly hasMultipleVehicleTypes = computed<boolean>(
    () => this.configuredVehicleTypes().length > 1
  );

  readonly expressVehicleType = linkedSignal<VehicleType[], VehicleType>({
    computation: (types, previous) => {
      if (types.length === 1) {
        return types[0];
      }
      if (previous && (types.length === 0 || types.includes(previous.value))) {
        return previous.value;
      }
      return types[0] ?? "CAR";
    },
    source: this.configuredVehicleTypes,
  });

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

  readonly kpiMetrics = computed<OperationsKpiMetrics>(() => ({
    availableCarSlotsCount: this.availableCarSlotsCount(),
    availableMotoSlotsCount: this.availableMotoSlotsCount(),
    availableSlotsCount: this.availableSlotsCount(),
    occupationBarPercentage: this.occupationBarPercentage(),
    occupationPercentage: this.occupationPercentage(),
    occupiedSlotsCount: this.occupiedSlotsCount(),
    totalCarSlotsCount: this.totalCarSlotsCount(),
    totalMotoSlotsCount: this.totalMotoSlotsCount(),
    totalSlotsCount: this.totalSlotsCount(),
  }));

  readonly omnibarState = computed<OperationsOmnibarState>(() => ({
    availableCarSlotsCount: this.availableCarSlotsCount(),
    availableMotoSlotsCount: this.availableMotoSlotsCount(),
    expressPlate: this.expressPlate(),
    expressVehicleType: this.expressVehicleType(),
    hasMultipleVehicleTypes: this.hasMultipleVehicleTypes(),
    isSubmittingExpressCheckIn: false,
    searchTicketQuery: this.searchTicketQuery(),
  }));

  readonly slotsGridFilters = computed<OperationsSlotsGridFilters>(() => ({
    statusFilter: this.statusFilter(),
    vehicleFilter: this.vehicleFilter(),
  }));

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

  bindRoute(
    paramMap$: Observable<ParamMap>,
    queryParamMap$?: Observable<ParamMap>
  ): void {
    paramMap$
      .pipe(
        switchMap((params) => {
          const id = params.get("parkingId");
          this.parkingId.set(id);
          if (!id) {
            this.activeTickets.set([]);
            return EMPTY;
          }
          return merge(
            this.slotService.getAllSlotSummariesByParkingId(id).pipe(
              catchError(() => EMPTY),
              ignoreElements()
            ),
            this.rateService.getRatesByParkingId(id).pipe(
              catchError(() => EMPTY),
              ignoreElements()
            ),
            this.ticketService
              .listTicketsByParkingLot(id)
              .pipe(catchError(() => of([])))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((tickets) => {
        const openTickets = (tickets ?? []).filter((t) => t.status === "OPEN");
        this.activeTickets.set(openTickets);
        this.tryProcessPendingCheckout(openTickets);
      });

    (queryParamMap$ ?? of(convertToParamMap({})))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((queryParams) => {
        const checkoutTicketId = queryParams.get("checkoutTicketId");
        if (checkoutTicketId) {
          this.pendingCheckoutTicketId = checkoutTicketId;
          this.tryProcessPendingCheckout(this.activeTickets());
          return;
        }
        this.pendingCheckoutTicketId = null;
      });
  }

  refreshActiveTickets(): void {
    const id = this.parkingId();
    if (!id) {
      return;
    }
    this.slotService
      .getAllSlotSummariesByParkingId(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
    this.ticketService
      .listTicketsByParkingLot(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.activeTickets.set([]),
        next: (tickets) => {
          const openTickets = (tickets ?? []).filter(
            (t) => t.status === "OPEN"
          );
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

  handleOmnibarAction(action: OperationsOmnibarAction): void {
    switch (action.type) {
      case "selectVehicleType": {
        this.setExpressVehicleType(action.vehicleType);
        return;
      }
      case "updatePlate": {
        this.expressPlate.set(action.plate);
        return;
      }
      case "submitCheckIn": {
        this.submitExpressCheckIn();
        return;
      }
      case "openUnplatedCheckIn": {
        this.openCheckInModal(true);
        return;
      }
      case "updateSearchQuery": {
        this.setSearchTicketQuery(action.query);
        return;
      }
      case "submitCheckOut": {
        this.submitExpressCheckOutByQuery();
        return;
      }
      case "openQrScanner": {
        this.openQrScanner();
        break;
      }
      default: {
        break;
      }
    }
  }

  handleSlotsFilterAction(action: OperationsSlotsFilterAction): void {
    if (action.type === "vehicle") {
      this.setVehicleFilter(action.value);
      return;
    }
    if (action.type === "status") {
      this.setStatusFilter(action.value);
      return;
    }
    this.resetSlotFilters();
  }

  onSlotClick(slot: SlotSummary): void {
    if (slot.status === "AVAILABLE") {
      this.checkInSpecificSlot(slot);
      return;
    }
    if (slot.status === "OCCUPIED") {
      this.checkOutSpecificSlot(slot);
    }
  }

  openCheckInModal(unplated = false, plate?: string, slot?: SlotSummary): void {
    this.selectedCheckInSlot.set(slot ?? null);
    this.checkInModalInitialUnplated.set(unplated);
    this.checkInModalInitialPlate.set(
      unplated ? "" : (plate ?? this.expressPlate())
    );
    this.isCheckInModalOpen.set(true);
  }

  closeCheckInModal(): void {
    this.isCheckInModalOpen.set(false);
    this.selectedCheckInSlot.set(null);
    this.checkInModalInitialUnplated.set(false);
    this.checkInModalInitialPlate.set("");
    this.expressPlate.set("");
    this.refreshActiveTickets();
  }

  checkInSpecificSlot(slot: SlotSummary): void {
    this.selectedCheckInSlot.set(slot);
    this.checkInModalInitialUnplated.set(false);
    this.checkInModalInitialPlate.set(this.expressPlate());
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
        message: this.texts.toasts.multipleVehiclesMatch,
        type: "warning",
      });
      return;
    }

    this.toast.showToast({
      message: this.texts.toasts.noMatchingVehicle,
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
    this.ticketService
      .getActiveTicketBySlot(slot.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          const msg =
            err?.error?.message || this.texts.toasts.noActiveTicketForSlot;
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

    let identifier: string = this.texts.toasts.qrScannedFallback;
    if (data.ticketId) {
      identifier = this.texts.toasts.qrTicketPrefix(data.ticketId.slice(0, 8));
    } else if (data.plate) {
      identifier = this.texts.toasts.qrPlatePrefix(data.plate);
    }

    this.toast.showToast({
      message: this.texts.toasts.qrNotFound(identifier),
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
    const cleanPlate = normalizeRawPlate(rawPlate);

    if (cleanPlate.length < 3 || cleanPlate.length > 7) {
      this.toast.showToast({
        message: this.texts.toasts.invalidPlate,
        type: "error",
      });
      return;
    }

    const targetType = typeOverride ?? this.expressVehicleType();
    const availableSlot = this.slots().find(
      (s) => s.status === "AVAILABLE" && s.type === targetType
    );

    if (!availableSlot) {
      const vehicleLabels = this.texts.toasts.vehicleLabels satisfies Record<
        VehicleType,
        string
      >;
      this.toast.showToast({
        message: this.texts.toasts.noAvailableSlotsForVehicle(
          vehicleLabels[targetType]
        ),
        type: "error",
      });
      return;
    }

    this.openCheckInModal(false, cleanPlate, availableSlot);
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
}
