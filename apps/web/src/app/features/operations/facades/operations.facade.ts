import { Injectable, computed, inject } from "@angular/core";
import type { ParamMap } from "@angular/router";
import type {
  OperationsOmnibarAction,
  OperationsSlotsFilterAction,
} from "@core/models/operations-cockpit.model";
import type { VehicleType } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";
import { ToastService } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import type { Observable } from "rxjs";

import type { ScannedQrData } from "../components/modals/qr-scanner-modal/qr-scanner-modal";
import * as cockpitHelpers from "./operations-cockpit.helpers";
import { OperationsDataStore } from "./operations-data.store";
import { OperationsModalsStore } from "./operations-modals.store";

@Injectable()
export class OperationsFacade {
  private readonly texts = APP_TEXTS.operations;
  private readonly data = inject(OperationsDataStore);
  private readonly modals = inject(OperationsModalsStore);
  private readonly toast = inject(ToastService);

  readonly parkingId = this.data.parkingId;
  readonly activeTickets = this.data.activeTickets;
  readonly expressPlate = this.data.expressPlate;
  readonly searchTicketQuery = this.data.searchTicketQuery;
  readonly vehicleFilter = this.data.vehicleFilter;
  readonly statusFilter = this.data.statusFilter;
  readonly parking = this.data.parking;
  readonly slots = this.data.slots;
  readonly rates = this.data.rates;
  readonly kpiMetrics = this.data.kpiMetrics;
  readonly totalSlotsCount = this.data.totalSlotsCount;
  readonly availableSlotsCount = this.data.availableSlotsCount;
  readonly availableCarSlotsCount = this.data.availableCarSlotsCount;
  readonly totalCarSlotsCount = this.data.totalCarSlotsCount;
  readonly availableMotoSlotsCount = this.data.availableMotoSlotsCount;
  readonly totalMotoSlotsCount = this.data.totalMotoSlotsCount;
  readonly occupiedSlotsCount = this.data.occupiedSlotsCount;
  readonly occupationPercentage = this.data.occupationPercentage;
  readonly occupationBarPercentage = computed(() =>
    Math.min(this.occupationPercentage(), 100)
  );
  readonly configuredVehicleTypes = this.data.configuredVehicleTypes;
  readonly hasMultipleVehicleTypes = this.data.hasMultipleVehicleTypes;
  readonly expressVehicleType = this.data.expressVehicleType;
  readonly omnibarState = this.data.omnibarState;
  readonly slotsGridFilters = this.data.slotsGridFilters;
  readonly filteredSlots = this.data.filteredSlots;
  readonly filteredActiveTickets = this.data.filteredActiveTickets;

  readonly isCheckInModalOpen = this.modals.isCheckInModalOpen;
  readonly selectedCheckInSlot = this.modals.selectedCheckInSlot;
  readonly checkInModalInitialUnplated =
    this.modals.checkInModalInitialUnplated;
  readonly checkInModalInitialPlate = this.modals.checkInModalInitialPlate;
  readonly isCheckOutModalOpen = this.modals.isCheckOutModalOpen;
  readonly selectedCheckoutTicket = this.modals.selectedCheckoutTicket;
  readonly isQrScannerOpen = this.modals.isQrScannerOpen;

  readonly setVehicleFilter = (vehicleFilter: string): void =>
    this.vehicleFilter.set(vehicleFilter);
  readonly setStatusFilter = (statusFilter: string): void =>
    this.statusFilter.set(statusFilter);
  readonly setSearchTicketQuery = (query: string): void =>
    this.searchTicketQuery.set(query);
  readonly setExpressVehicleType = (vehicleType: VehicleType): void =>
    this.expressVehicleType.set(vehicleType);
  readonly openDirectCheckOutModal = (): void =>
    this.modals.openDirectCheckOut();
  readonly checkOutWithTicket = (ticket: TicketSummary): void =>
    this.modals.openCheckOutWithTicket(ticket);
  readonly openQrScanner = (): void => this.modals.openQrScanner();
  readonly closeQrScanner = (): void => this.modals.closeQrScanner();

  bindRoute(
    paramMap$: Observable<ParamMap>,
    queryParamMap$?: Observable<ParamMap>
  ): void {
    this.data.bindRoute(paramMap$, queryParamMap$, (ticket) =>
      this.checkOutWithTicket(ticket)
    );
  }

  refreshActiveTickets(): void {
    this.data.refreshActiveTickets((ticket) => this.checkOutWithTicket(ticket));
  }

  resetSlotFilters(): void {
    this.vehicleFilter.set("ALL");
    this.statusFilter.set("ALL");
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

  closeCheckOutModal(): void {
    this.modals.closeCheckOut();
    this.refreshActiveTickets();
  }

  handleOmnibarAction(action: OperationsOmnibarAction): void {
    if (action.type === "selectVehicleType") {
      this.setExpressVehicleType(action.vehicleType);
    } else if (action.type === "updatePlate") {
      this.expressPlate.set(action.plate);
    } else if (action.type === "submitCheckIn") {
      this.submitExpressCheckIn();
    } else if (action.type === "openUnplatedCheckIn") {
      this.openCheckInModal(true);
    } else if (action.type === "updateSearchQuery") {
      this.setSearchTicketQuery(action.query);
    } else if (action.type === "submitCheckOut") {
      this.submitExpressCheckOutByQuery();
    } else if (action.type === "openQrScanner") {
      this.openQrScanner();
    }
  }

  handleSlotsFilterAction(action: OperationsSlotsFilterAction): void {
    if (action.type === "vehicle") {
      this.setVehicleFilter(action.value);
    } else if (action.type === "status") {
      this.setStatusFilter(action.value);
    } else {
      this.resetSlotFilters();
    }
  }

  onSlotClick(slot: SlotSummary): void {
    if (slot.status === "AVAILABLE") {
      this.checkInSpecificSlot(slot);
    } else if (slot.status === "OCCUPIED") {
      this.checkOutSpecificSlot(slot);
    }
  }

  submitExpressCheckOutByQuery(queryOverride?: string): void {
    const match = cockpitHelpers.findCheckoutTicketMatch(
      this.activeTickets(),
      queryOverride ?? this.searchTicketQuery()
    );
    if (match.status === "empty") {
      this.openDirectCheckOutModal();
    } else if (match.status === "matched") {
      this.checkOutWithTicket(match.ticket);
    } else {
      const isMultiple = match.status === "multiple";
      this.notify(
        isMultiple
          ? this.texts.toasts.multipleVehiclesMatch
          : this.texts.toasts.noMatchingVehicle,
        isMultiple ? "warning" : "error"
      );
    }
  }

  checkOutSpecificSlot(slot: SlotSummary): void {
    this.data.getActiveTicketBySlot(slot.id).subscribe({
      error: (err) =>
        this.notify(
          err?.error?.message || this.texts.toasts.noActiveTicketForSlot,
          "error"
        ),
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
    this.notify(this.texts.toasts.qrNotFound(identifier), "error");
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
      this.notify(this.texts.toasts.invalidPlate, "error");
      return;
    }
    if (result.status === "noSlot") {
      const vehicleLabels = this.texts.toasts.vehicleLabels satisfies Record<
        VehicleType,
        string
      >;
      this.notify(
        this.texts.toasts.noAvailableSlotsForVehicle(
          vehicleLabels[result.vehicleType]
        ),
        "error"
      );
      return;
    }
    this.openCheckInModal(false, result.cleanPlate, result.slot);
  }

  private notify(message: string, type: "error" | "warning"): void {
    this.toast.showToast({ message, type });
  }
}
