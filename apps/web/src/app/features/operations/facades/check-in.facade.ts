import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { RateModel, VehicleType } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import type { PlateCountry, TicketSummary } from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import {
  PLATE_STATE_MACHINE,
  normalizeRawPlate,
} from "@shared/utils/plate.utils";

import {
  buildCheckInPayload,
  findFirstAvailableSlotId,
  findFirstRateId,
  getAvailableVehicleTypes,
  getConfiguredVehicleTypes,
  isValidEmailFormat,
  resolveDefaultVehicleType,
} from "./check-in.helpers";

@Injectable()
export class CheckInFacade {
  private readonly ticketService = inject(TicketService);
  private readonly slotService = inject(SlotService);
  private readonly rateService = inject(RateService);
  private readonly parkingService = inject(ParkingService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly parkingId = signal<string | null>(null);
  readonly plate = signal<string>("");
  readonly email = signal<string>("");
  readonly vehicleType = signal<VehicleType>("CAR");
  readonly selectedSlotId = signal<string | null>(null);
  readonly selectedRateId = signal<string | null>(null);
  readonly plateCountry = signal<PlateCountry>("CO");
  readonly photoUrl = signal<string | null>(null);
  readonly phoneNumber = signal<string>("");
  readonly deliveryMethod = signal<"PRINT" | "WHATSAPP" | "EMAIL">("PRINT");
  readonly isUnplated = computed<boolean>(
    () => this.plateCountry() === "UNPLATED"
  );
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly lastIssuedTicket = signal<TicketSummary | null>(null);
  readonly isReceiptOpen = signal<boolean>(false);

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

  readonly allSlots = computed<SlotSummary[]>(() => {
    const id = this.parkingId();
    return id ? (this.slotService.summaries()[id] ?? []) : [];
  });

  readonly availableSlots = computed<SlotSummary[]>(() => {
    const type = this.vehicleType();
    return this.allSlots().filter(
      (slot) => slot.status === "AVAILABLE" && slot.type === type
    );
  });

  readonly allRates = computed<RateModel[]>(() => {
    const id = this.parkingId();
    return id ? (this.rateService.ratesByParking()[id] ?? []) : [];
  });

  readonly availableVehicleTypes = computed<VehicleType[]>(() =>
    getAvailableVehicleTypes(this.allSlots())
  );

  readonly availableRates = computed<RateModel[]>(() => {
    const type = this.vehicleType();
    return this.allRates().filter((rate) => rate.vehicleType === type);
  });

  readonly configuredVehicleTypes = computed<VehicleType[]>(() =>
    getConfiguredVehicleTypes(this.allSlots(), this.allRates())
  );

  readonly hasMultipleVehicleTypes = computed<boolean>(
    () => this.configuredVehicleTypes().length > 1
  );

  readonly hasAvailableSlots = computed<boolean>(
    () => this.availableSlots().length > 0
  );

  readonly isEmailValid = computed<boolean>(
    () =>
      this.deliveryMethod() === "WHATSAPP" || isValidEmailFormat(this.email())
  );

  readonly isPlateValid = computed<boolean>(() =>
    PLATE_STATE_MACHINE[this.plateCountry()].validate(
      normalizeRawPlate(this.plate()),
      Boolean(this.photoUrl())
    )
  );

  readonly hasSelectedResources = computed<boolean>(
    () => this.selectedSlotId() !== null && this.selectedRateId() !== null
  );

  readonly isValid = computed<boolean>(
    () =>
      !this.isSubmitting() &&
      this.hasSelectedResources() &&
      this.isEmailValid() &&
      this.isPlateValid()
  );

  init(parkingId: string): void {
    this.parkingId.set(parkingId);
    this.loadData(parkingId);
  }

  /** Coordinates loading slots and rates for the given parking lot. */
  loadData(parkingId: string): void {
    this.loadSlots(parkingId);
    this.loadRates(parkingId);
  }

  /** Fetches slot summaries and auto-adjusts vehicle type from capacity or single config. */
  loadSlots(parkingId: string): void {
    this.slotService
      .getAllSlotSummariesByParkingId(parkingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {},
        next: (slots) => {
          const resolved = resolveDefaultVehicleType(
            this.configuredVehicleTypes(),
            getAvailableVehicleTypes(slots),
            this.vehicleType()
          );
          this.setVehicleType(resolved ?? this.vehicleType());
        },
      });
  }

  /** Fetches rates and selects the first matching rate for the active vehicle type. */
  loadRates(parkingId: string): void {
    this.rateService
      .getRatesByParkingId(parkingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {},
        next: (rates) => {
          if (this.selectedRateId()) {
            return;
          }
          const rateId = findFirstRateId(rates ?? [], this.vehicleType());
          if (!rateId) {
            return;
          }
          this.selectedRateId.set(rateId);
        },
      });
  }

  setPlate(plate: string, detectedCountry?: PlateCountry): void {
    if (detectedCountry && detectedCountry !== "UNPLATED") {
      this.plateCountry.set(detectedCountry);
    }
    const { maxFormattedLength } = PLATE_STATE_MACHINE[this.plateCountry()];
    this.plate.set(plate.toUpperCase().trim().slice(0, maxFormattedLength));
    this.errorMessage.set(null);
  }

  setIsUnplated(unplated: boolean): void {
    if (unplated) {
      this.plate.set("");
      this.setPlateCountry("UNPLATED");
      return;
    }
    if (this.isUnplated()) {
      this.setPlateCountry("CO");
      return;
    }
    this.errorMessage.set(null);
  }

  setEmail(email: string): void {
    this.email.set(email.trim());
  }

  setDeliveryMethod(method: "PRINT" | "WHATSAPP" | "EMAIL"): void {
    this.deliveryMethod.set(method);
    if (method === "PRINT") {
      this.phoneNumber.set("");
      this.email.set("");
    }
  }

  setPlateCountry(country: PlateCountry): void {
    this.plateCountry.set(country);
    this.errorMessage.set(null);
    if (
      country === "UNPLATED" &&
      this.availableVehicleTypes().includes("MOTORCYCLE")
    ) {
      this.setVehicleType("MOTORCYCLE");
    }
  }

  setPhotoUrl(url: string | null): void {
    this.photoUrl.set(url);
    this.errorMessage.set(null);
  }

  setPhoneNumber(phone: string): void {
    this.phoneNumber.set(phone.trim());
  }

  setVehicleType(type: VehicleType): void {
    this.vehicleType.set(type);
    this.selectedSlotId.set(findFirstAvailableSlotId(this.allSlots(), type));
    this.selectedRateId.set(findFirstRateId(this.allRates(), type));
  }

  setSlotId(slotId: string | null): void {
    this.selectedSlotId.set(slotId);
  }

  setRateId(rateId: string | null): void {
    this.selectedRateId.set(rateId);
  }

  submitCheckIn(): void {
    const pId = this.parkingId();
    const slotId = this.selectedSlotId();
    const rateId = this.selectedRateId();
    if (!pId || !slotId || !rateId || !this.isValid()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload = buildCheckInPayload({
      deliveryMethod: this.deliveryMethod(),
      email: this.email(),
      phoneNumber: this.phoneNumber(),
      photoUrl: this.photoUrl(),
      plate: this.plate(),
      plateCountry: this.plateCountry(),
      rateId,
      slotId,
    });

    this.ticketService
      .createTicket(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          this.isSubmitting.set(false);
          const errorMsg =
            err?.error?.message ||
            err?.message ||
            APP_TEXTS.checkIn.submitErrorFallback;
          this.errorMessage.set(errorMsg);
          this.toast.showToast({ message: errorMsg, type: "error" });
        },
        next: (ticket) => this.handleCheckInSuccess(ticket, pId),
      });
  }

  closeReceipt(): void {
    this.isReceiptOpen.set(false);
  }

  reset(): void {
    this.resetFormInputs();
    this.errorMessage.set(null);
    this.selectedSlotId.set(null);
    this.selectedRateId.set(null);

    const resolved = resolveDefaultVehicleType(
      this.configuredVehicleTypes(),
      this.availableVehicleTypes(),
      this.vehicleType()
    );
    if (resolved) {
      this.setVehicleType(resolved);
    }
  }

  private resetFormInputs(): void {
    this.plate.set("");
    this.email.set("");
    this.photoUrl.set(null);
    this.phoneNumber.set("");
    this.plateCountry.set("CO");
    this.deliveryMethod.set("PRINT");
  }

  private handleCheckInSuccess(ticket: TicketSummary, parkingId: string): void {
    this.isSubmitting.set(false);
    this.lastIssuedTicket.set(ticket);
    this.isReceiptOpen.set(true);
    this.toast.showToast({
      message: APP_TEXTS.checkIn.submitSuccessToast,
      type: "success",
    });

    // Refresh slots state
    this.slotService
      .getAllSlotSummariesByParkingId(parkingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => {} });

    this.resetFormInputs();
  }
}
