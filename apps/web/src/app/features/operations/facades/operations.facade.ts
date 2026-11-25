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
import type { Observable } from "rxjs";
import { EMPTY, catchError, ignoreElements, merge, of, switchMap } from "rxjs";

import type { ScannedQrData } from "../components/modals/qr-scanner-modal/qr-scanner-modal";
import * as cockpitHelpers from "./operations-cockpit.helpers";
import { OperationsModalsStore } from "./operations-modals.store";

@Injectable()
export class OperationsFacade {
  private readonly texts = APP_TEXTS.operations;
  private readonly parkingService = inject(ParkingService);
  private readonly slotService = inject(SlotService);
  private readonly rateService = inject(RateService);
  private readonly ticketService = inject(TicketService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly modals = inject(OperationsModalsStore);

  readonly parkingId = signal<string | null>(null);
  readonly isCheckInModalOpen = this.modals.isCheckInModalOpen;
  readonly selectedCheckInSlot = this.modals.selectedCheckInSlot;
  readonly checkInModalInitialUnplated =
    this.modals.checkInModalInitialUnplated;
  readonly checkInModalInitialPlate = this.modals.checkInModalInitialPlate;
  readonly isCheckOutModalOpen = this.modals.isCheckOutModalOpen;
  readonly selectedCheckoutTicket = this.modals.selectedCheckoutTicket;
  readonly isQrScannerOpen = this.modals.isQrScannerOpen;
  readonly expressPlate = signal<string>("");
  readonly activeTickets = signal<TicketSummary[]>([]);
  readonly searchTicketQuery = signal<string>("");
  readonly vehicleFilter = signal<string>("ALL");
  readonly statusFilter = signal<string>("ALL");
  private pendingCheckoutTicketId: string | null = null;

  readonly parking = computed(() => {
    const id = this.parkingId();
    return id
      ? ((this.parkingService.parkingLots() ?? []).find(
          (lot) => lot.id === id
        ) ?? null)
      : null;
  });
  readonly slots = computed<SlotSummary[]>(() => {
    const id = this.parkingId();
    return id ? (this.slotService.summaries()[id] ?? []) : [];
  });
  readonly rates = computed(() => {
    const id = this.parkingId();
    return id ? (this.rateService.ratesByParking()[id] ?? []) : [];
  });
  readonly kpiMetrics = computed<OperationsKpiMetrics>(() =>
    cockpitHelpers.buildOperationsKpiMetrics(this.slots())
  );
  readonly totalSlotsCount = computed(() => this.kpiMetrics().totalSlotsCount);
  readonly availableSlotsCount = computed(
    () => this.kpiMetrics().availableSlotsCount
  );
  readonly availableCarSlotsCount = computed(
    () => this.kpiMetrics().availableCarSlotsCount
  );
  readonly totalCarSlotsCount = computed(
    () => this.kpiMetrics().totalCarSlotsCount
  );
  readonly availableMotoSlotsCount = computed(
    () => this.kpiMetrics().availableMotoSlotsCount
  );
  readonly totalMotoSlotsCount = computed(
    () => this.kpiMetrics().totalMotoSlotsCount
  );
  readonly occupiedSlotsCount = computed(
    () => this.kpiMetrics().occupiedSlotsCount
  );
  readonly occupationPercentage = computed(
    () => this.kpiMetrics().occupationPercentage
  );
  readonly occupationBarPercentage = computed(() =>
    Math.min(this.occupationPercentage(), 100)
  );
  readonly configuredVehicleTypes = computed<VehicleType[]>(() =>
    cockpitHelpers.extractConfiguredVehicleTypes(this.slots(), this.rates())
  );
  readonly hasMultipleVehicleTypes = computed<boolean>(
    () => this.configuredVehicleTypes().length > 1
  );
  readonly expressVehicleType = linkedSignal<VehicleType[], VehicleType>({
    computation: (types, previous) =>
      cockpitHelpers.resolveExpressVehicleType(types, previous?.value),
    source: this.configuredVehicleTypes,
  });
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
  readonly filteredSlots = computed(() =>
    cockpitHelpers.filterOperationsSlots(
      this.slots(),
      this.vehicleFilter(),
      this.statusFilter()
    )
  );
  readonly filteredActiveTickets = computed(() =>
    cockpitHelpers.filterActiveTicketsByQuery(
      this.activeTickets(),
      this.searchTicketQuery()
    )
  );

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
      .subscribe((tickets) => this.applyOpenTickets(tickets));

    (queryParamMap$ ?? of(convertToParamMap({})))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((queryParams) => {
        this.pendingCheckoutTicketId = queryParams.get("checkoutTicketId");
        if (this.pendingCheckoutTicketId) {
          this.tryProcessPendingCheckout(this.activeTickets());
        }
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
        next: (tickets) => this.applyOpenTickets(tickets),
      });
  }

  setVehicleFilter(vehicleFilter: string): void {
    this.vehicleFilter.set(vehicleFilter);
  }
  setStatusFilter(statusFilter: string): void {
    this.statusFilter.set(statusFilter);
  }
  resetSlotFilters(): void {
    this.vehicleFilter.set("ALL");
    this.statusFilter.set("ALL");
  }
  setSearchTicketQuery(query: string): void {
    this.searchTicketQuery.set(query);
  }
  setExpressVehicleType(vehicleType: VehicleType): void {
    this.expressVehicleType.set(vehicleType);
  }
  openCheckInModal(unplated = false, plate?: string, slot?: SlotSummary): void {
    this.modals.openCheckIn(
      unplated,
      plate ?? this.expressPlate(),
      slot ?? null
    );
  }
  closeCheckInModal(): void {
    this.modals.closeCheckIn();
    this.expressPlate.set("");
    this.refreshActiveTickets();
  }
  checkInSpecificSlot(slot: SlotSummary): void {
    this.modals.openCheckIn(false, this.expressPlate(), slot);
  }
  openDirectCheckOutModal(): void {
    this.modals.openDirectCheckOut();
  }
  checkOutWithTicket(ticket: TicketSummary): void {
    this.modals.openCheckOutWithTicket(ticket);
  }
  closeCheckOutModal(): void {
    this.modals.closeCheckOut();
    this.refreshActiveTickets();
  }
  openQrScanner(): void {
    this.modals.openQrScanner();
  }
  closeQrScanner(): void {
    this.modals.closeQrScanner();
  }

  handleOmnibarAction(action: OperationsOmnibarAction): void {
    switch (action.type) {
      case "selectVehicleType": {
        this.setExpressVehicleType(action.vehicleType);
        break;
      }
      case "updatePlate": {
        this.expressPlate.set(action.plate);
        break;
      }
      case "submitCheckIn": {
        this.submitExpressCheckIn();
        break;
      }
      case "openUnplatedCheckIn": {
        this.openCheckInModal(true);
        break;
      }
      case "updateSearchQuery": {
        this.setSearchTicketQuery(action.query);
        break;
      }
      case "submitCheckOut": {
        this.submitExpressCheckOutByQuery();
        break;
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

  submitExpressCheckOutByQuery(queryOverride?: string): void {
    const matchResult = cockpitHelpers.findCheckoutTicketMatch(
      this.activeTickets(),
      queryOverride ?? this.searchTicketQuery()
    );
    switch (matchResult.status) {
      case "empty": {
        this.openDirectCheckOutModal();
        break;
      }
      case "matched": {
        this.checkOutWithTicket(matchResult.ticket);
        break;
      }
      case "multiple": {
        this.toast.showToast({
          message: this.texts.toasts.multipleVehiclesMatch,
          type: "warning",
        });
        break;
      }
      case "none": {
        this.toast.showToast({
          message: this.texts.toasts.noMatchingVehicle,
          type: "error",
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  checkOutSpecificSlot(slot: SlotSummary): void {
    this.ticketService
      .getActiveTicketBySlot(slot.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) =>
          this.toast.showToast({
            message:
              err?.error?.message || this.texts.toasts.noActiveTicketForSlot,
            type: "error",
          }),
        next: (ticket) => this.checkOutWithTicket(ticket),
      });
  }

  onQrScanned(data: ScannedQrData): void {
    this.closeQrScanner();
    const matchedTicket = cockpitHelpers.findTicketByScannedQr(
      this.activeTickets(),
      data
    );
    if (matchedTicket) {
      this.checkOutWithTicket(matchedTicket);
      return;
    }
    const identifier = cockpitHelpers.buildQrNotFoundIdentifier(
      data,
      this.texts.toasts
    );
    this.toast.showToast({
      message: this.texts.toasts.qrNotFound(identifier),
      type: "error",
    });
  }

  submitExpressCheckIn(
    plateOverride?: string,
    typeOverride?: VehicleType
  ): void {
    const result = cockpitHelpers.validateExpressCheckIn(
      this.slots(),
      plateOverride ?? this.expressPlate(),
      typeOverride ?? this.expressVehicleType()
    );
    if (result.status === "invalidPlate") {
      this.toast.showToast({
        message: this.texts.toasts.invalidPlate,
        type: "error",
      });
      return;
    }
    if (result.status === "noSlot") {
      const vehicleLabels = this.texts.toasts.vehicleLabels satisfies Record<
        VehicleType,
        string
      >;
      this.toast.showToast({
        message: this.texts.toasts.noAvailableSlotsForVehicle(
          vehicleLabels[result.vehicleType]
        ),
        type: "error",
      });
      return;
    }
    this.openCheckInModal(false, result.cleanPlate, result.slot);
  }

  private applyOpenTickets(tickets: TicketSummary[] | null | undefined): void {
    const openTickets = (tickets ?? []).filter(
      (ticket) => ticket.status === "OPEN"
    );
    this.activeTickets.set(openTickets);
    this.tryProcessPendingCheckout(openTickets);
  }

  private tryProcessPendingCheckout(
    tickets: TicketSummary[] = this.activeTickets()
  ): void {
    if (!this.pendingCheckoutTicketId) {
      return;
    }
    const match = tickets.find(
      (ticket) => ticket.id === this.pendingCheckoutTicketId
    );
    if (!match) {
      return;
    }
    this.pendingCheckoutTicketId = null;
    this.checkOutWithTicket(match);
  }
}
