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
  OperationsOmnibarState,
  OperationsSlotsGridFilters,
} from "@core/models/operations-cockpit.model";
import type { VehicleType } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import type { Observable } from "rxjs";
import { EMPTY, catchError, ignoreElements, merge, of, switchMap } from "rxjs";

import * as cockpitHelpers from "./operations-cockpit.helpers";

@Injectable()
export class OperationsDataStore {
  private readonly parkingService = inject(ParkingService);
  private readonly slotService = inject(SlotService);
  private readonly rateService = inject(RateService);
  private readonly ticketService = inject(TicketService);
  private readonly destroyRef = inject(DestroyRef);

  readonly parkingId = signal<string | null>(null);
  readonly activeTickets = signal<TicketSummary[]>([]);
  readonly expressPlate = signal<string>("");
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
    queryParamMap$: Observable<ParamMap> | undefined,
    onPendingCheckoutMatch: (ticket: TicketSummary) => void
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
      .subscribe((tickets) =>
        this.applyOpenTickets(tickets, onPendingCheckoutMatch)
      );

    (queryParamMap$ ?? of(convertToParamMap({})))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((queryParams) => {
        this.pendingCheckoutTicketId = queryParams.get("checkoutTicketId");
        if (this.pendingCheckoutTicketId) {
          this.tryProcessPendingCheckout(
            this.activeTickets(),
            onPendingCheckoutMatch
          );
        }
      });
  }

  refreshActiveTickets(
    onPendingCheckoutMatch: (ticket: TicketSummary) => void
  ): void {
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
        next: (tickets) =>
          this.applyOpenTickets(tickets, onPendingCheckoutMatch),
      });
  }

  getActiveTicketBySlot(slotId: string): Observable<TicketSummary> {
    return this.ticketService
      .getActiveTicketBySlot(slotId)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  private applyOpenTickets(
    tickets: TicketSummary[] | null | undefined,
    onPendingCheckoutMatch: (ticket: TicketSummary) => void
  ): void {
    const openTickets = (tickets ?? []).filter(
      (ticket) => ticket.status === "OPEN"
    );
    this.activeTickets.set(openTickets);
    this.tryProcessPendingCheckout(openTickets, onPendingCheckoutMatch);
  }

  private tryProcessPendingCheckout(
    tickets: TicketSummary[],
    onPendingCheckoutMatch: (ticket: TicketSummary) => void
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
    onPendingCheckoutMatch(match);
  }
}
