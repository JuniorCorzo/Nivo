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
import type {
  CreateTicketPayload,
  PlateCountry,
  TicketSummary,
} from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";

const VE_PLATE_REGEX =
  /^(?<vePlate>[A-Z]{2}\d{3}[A-Z]{2}|[A-Z]{4}\d{3}|[A-Z]{3}\d{2}[A-Z]|[A-Z]{2}\d[A-Z]\d{2}[A-Z])$/u;

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
    if (!id) {
      return [];
    }
    return this.slotService.summaries()[id] ?? [];
  });

  readonly availableSlots = computed<SlotSummary[]>(() => {
    const type = this.vehicleType();
    return this.allSlots().filter(
      (slot) => slot.status === "AVAILABLE" && slot.type === type
    );
  });

  readonly allRates = computed<RateModel[]>(() => {
    const id = this.parkingId();
    if (!id) {
      return [];
    }
    return this.rateService.ratesByParking()[id] ?? [];
  });

  readonly availableVehicleTypes = computed<VehicleType[]>(() => {
    const slots = this.allSlots();
    const availableTypes = new Set<string>();
    for (const slot of slots) {
      if (slot.status === "AVAILABLE") {
        availableTypes.add(slot.type);
      }
    }
    const order: VehicleType[] = ["CAR", "MOTORCYCLE", "BIKE"];
    return order.filter((type) => availableTypes.has(type));
  });

  readonly availableRates = computed<RateModel[]>(() => {
    const type = this.vehicleType();
    return this.allRates().filter((rate) => rate.vehicleType === type);
  });

  readonly configuredVehicleTypes = computed<VehicleType[]>(() => {
    const slots = this.allSlots();
    const rates = this.allRates();
    const types = new Set<string>();
    for (const slot of slots) {
      if (
        slot.type === "CAR" ||
        slot.type === "MOTORCYCLE" ||
        slot.type === "BIKE"
      ) {
        types.add(slot.type);
      }
    }
    for (const rate of rates) {
      if (rate.vehicleType) {
        types.add(rate.vehicleType);
      }
    }
    const order: VehicleType[] = ["CAR", "MOTORCYCLE", "BIKE"];
    return order.filter((type) => types.has(type));
  });

  readonly hasMultipleVehicleTypes = computed<boolean>(
    () => this.configuredVehicleTypes().length > 1
  );

  readonly hasAvailableSlots = computed<boolean>(
    () => this.availableSlots().length > 0
  );

  readonly isValid = computed<boolean>(() => {
    if (this.isSubmitting()) {
      return false;
    }
    if (this.selectedSlotId() === null || this.selectedRateId() === null) {
      return false;
    }

    if (this.email().trim() && !this.email().includes("@")) {
      return false;
    }

    if (
      this.deliveryMethod() === "EMAIL" &&
      (!this.email().trim() || !this.email().includes("@"))
    ) {
      return false;
    }

    if (this.deliveryMethod() === "WHATSAPP" && !this.phoneNumber().trim()) {
      return false;
    }

    if (this.isUnplated()) {
      return Boolean(this.photoUrl());
    }

    const cleaned = this.plate().replaceAll(/[\s-]/gu, "").toUpperCase();
    if (this.plateCountry() === "VE") {
      return VE_PLATE_REGEX.test(cleaned);
    }

    return cleaned.length === 6;
  });

  init(parkingId: string): void {
    this.parkingId.set(parkingId);
    this.loadData(parkingId);
  }

  loadData(parkingId: string): void {
    this.slotService
      .getAllSlotSummariesByParkingId(parkingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((slots) => {
        const configured = this.configuredVehicleTypes();
        if (configured.length === 1) {
          this.setVehicleType(configured[0]);
          return;
        }
        const allKnownTypes: VehicleType[] = ["CAR", "MOTORCYCLE", "BIKE"];
        const available = allKnownTypes.filter((t) =>
          slots.some((s) => s.status === "AVAILABLE" && s.type === t)
        );
        if (available.length > 0 && !available.includes(this.vehicleType())) {
          this.setVehicleType(available[0]);
        } else {
          this.setVehicleType(this.vehicleType());
        }
      });
    this.rateService
      .getRatesByParkingId(parkingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rates) => {
      if (!this.selectedRateId()) {
        const type = this.vehicleType();
        const matchingRates = (rates ?? []).filter(
          (r) => r.vehicleType === type
        );
        if (matchingRates.length > 0) {
          this.selectedRateId.set(matchingRates[0].id);
        }
      }
    });
  }

  setPlate(plate: string, detectedCountry?: PlateCountry): void {
    if (detectedCountry && detectedCountry !== "UNPLATED") {
      this.plateCountry.set(detectedCountry);
    }
    const maxLen = this.plateCountry() === "VE" ? 9 : 7;
    this.plate.set(plate.toUpperCase().trim().slice(0, maxLen));
    this.errorMessage.set(null);
  }

  setIsUnplated(unplated: boolean): void {
    if (unplated) {
      this.plateCountry.set("UNPLATED");
      this.plate.set("");
      const available = this.availableVehicleTypes();
      if (available.includes("MOTORCYCLE")) {
        this.setVehicleType("MOTORCYCLE");
      }
    } else if (this.plateCountry() === "UNPLATED") {
      this.plateCountry.set("CO");
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
    if (country === "UNPLATED") {
      const available = this.availableVehicleTypes();
      if (available.includes("MOTORCYCLE")) {
        this.setVehicleType("MOTORCYCLE");
      }
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

    // Auto-select first available slot for this vehicle type
    const slots = this.allSlots().filter(
      (s) => s.status === "AVAILABLE" && s.type === type
    );
    this.selectedSlotId.set(slots.length > 0 ? slots[0].id : null);

    // Auto-select first rate for this vehicle type
    const rates = this.allRates().filter((r) => r.vehicleType === type);
    this.selectedRateId.set(rates.length > 0 ? rates[0].id : null);
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
    const plate = this.isUnplated()
      ? this.plate().trim().toUpperCase() || "SIN PLACA"
      : this.plate().trim().toUpperCase();

    if (!pId || !slotId || !rateId) {
      return;
    }

    if (!this.isUnplated() && !plate) {
      return;
    }

    if (this.isUnplated() && !this.photoUrl()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const emailToSend =
      this.deliveryMethod() === "EMAIL"
        ? this.email().trim() || undefined
        : undefined;
    const phoneToSend =
      this.deliveryMethod() === "WHATSAPP"
        ? this.phoneNumber().trim() || undefined
        : undefined;

    const payload: CreateTicketPayload = {
      email: emailToSend,
      phoneNumber: phoneToSend,
      photoUrl: this.photoUrl() || undefined,
      plate,
      plateCountry: this.plateCountry(),
      rateId,
      slotId,
    };

    this.ticketService
      .createTicket(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          "Error al registrar el ingreso. Verifique la placa y disponibilidad de cupo.";
        this.errorMessage.set(errorMsg);
        this.toast.showToast({ message: errorMsg, type: "error" });
      },
      next: (ticket) => {
        this.isSubmitting.set(false);
        this.lastIssuedTicket.set(ticket);
        this.isReceiptOpen.set(true);
        this.toast.showToast({
          message: "Ingreso registrado con éxito",
          type: "success",
        });

        // Refresh slots state
        this.slotService
          .getAllSlotSummariesByParkingId(pId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();

        // Reset plate, email, photo, phone, country for next rapid check-in
        this.plate.set("");
        this.email.set("");
        this.photoUrl.set(null);
        this.phoneNumber.set("");
        this.plateCountry.set("CO");
        this.deliveryMethod.set("PRINT");
      },
    });
  }

  closeReceipt(): void {
    this.isReceiptOpen.set(false);
  }

  reset(): void {
    this.plate.set("");
    this.email.set("");
    this.photoUrl.set(null);
    this.phoneNumber.set("");
    this.plateCountry.set("CO");
    this.errorMessage.set(null);
    this.selectedSlotId.set(null);
    this.selectedRateId.set(null);
    this.deliveryMethod.set("PRINT");

    const configured = this.configuredVehicleTypes();
    if (configured.length === 1) {
      this.setVehicleType(configured[0]);
      return;
    }

    const available = this.availableVehicleTypes();
    if (available.length > 0) {
      const current = this.vehicleType();
      this.setVehicleType(available.includes(current) ? current : available[0]);
    }
  }
}
