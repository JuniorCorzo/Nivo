import { computed, effect, inject, Injectable, signal } from "@angular/core";
import type { FieldTree, ValidationError } from "@angular/forms/signals";
import {
  disabled,
  form,
  maxLength,
  minLength,
  pattern,
  required,
} from "@angular/forms/signals";
import type { UpsertParkingLotsModel } from "@core/models/parking.model";
import { ColombiaService } from "@core/service/colombia-service";
import { ParkingService } from "@core/services/parking-service";
import type { Coordinates } from "@core/type/coordinates.type";
import type {
  SlotDistribution,
  SlotType,
} from "@core/type/slot-distribution.type";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { formatCoordinate } from "@shared/utils/coordinates.utils";

import type { CoordinateSummary } from "../components/parking-form/sections/parking-location-section";

export type ParkingFormMode = "create" | "edit";

@Injectable()
export class ParkingFormFacade {
  private readonly colombiaService = inject(ColombiaService);
  private readonly parkingService = inject(ParkingService);
  private readonly fieldTexts = APP_TEXTS.parking.form.fields;

  readonly mode = signal<ParkingFormMode>("create");
  readonly parkingId = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly selectedCoordinates = signal<Coordinates | null>(null);
  readonly isMapPlaceholderVisible = signal(true);
  readonly departments = this.colombiaService.departaments;
  readonly cities = signal<string[]>([]);
  readonly slots = signal<SlotDistribution[]>([]);
  private readonly originalSlots = signal<SlotDistribution[]>([]);
  readonly slotsChanged = computed(
    () => JSON.stringify(this.originalSlots()) !== JSON.stringify(this.slots())
  );
  readonly slotTypeOptions: { value: SlotType; label: string }[] = [
    { label: "Carro", value: "CAR" },
    { label: "Moto", value: "MOTORCYCLE" },
    { label: "Bicicleta", value: "BIKE" },
    { label: "Vehículo eléctrico", value: "ELECTRIC_VEHICLE" },
    { label: "Discapacitados", value: "DISABLED" },
  ];

  readonly upsertModel = signal<UpsertParkingLotsModel>({
    address: {
      city: "",
      country: "Colombia",
      state: "",
      street: "",
      zipCode: "",
    },
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    currency: "COP",
    name: "",
    operatingHours: {
      closeTime: "",
      openTime: "",
    },
    timezone: "UTC-05:00",
  });

  readonly form = form(this.upsertModel, (schemaPath) => {
    required(schemaPath.name, {
      message: this.fieldTexts.name.errors.required,
    });
    minLength(schemaPath.name, 3, {
      message: this.fieldTexts.name.errors.minLength,
    });
    maxLength(schemaPath.name, 100, {
      message: this.fieldTexts.name.errors.maxLength,
    });

    required(schemaPath.address.street, {
      message: this.fieldTexts.address.street.errors.required,
    });
    disabled(schemaPath.address.city, () => this.cities().length === 0);
    required(schemaPath.address.city, {
      message: this.fieldTexts.address.city.errors.required,
    });
    required(schemaPath.address.state, {
      message: this.fieldTexts.address.state.errors.required,
    });
    pattern(schemaPath.address.zipCode, /^[0-9]*$/u, {
      message: this.fieldTexts.address.zipCode.errors.invalid,
    });

    required(schemaPath.operatingHours.openTime, {
      message: this.fieldTexts.operatingHours.openTime.errors.required,
    });
    pattern(
      schemaPath.operatingHours.openTime,
      /^(?<hours>[0-1]?[0-9]|2[0-3]):(?<minutes>[0-5][0-9])$/u,
      {
        message: this.fieldTexts.operatingHours.openTime.errors.invalidFormat,
      }
    );
    required(schemaPath.operatingHours.closeTime, {
      message: this.fieldTexts.operatingHours.closeTime.errors.required,
    });
    pattern(
      schemaPath.operatingHours.closeTime,
      /^(?<hours>[0-1]?[0-9]|2[0-3]):(?<minutes>[0-5][0-9])$/u,
      {
        message: this.fieldTexts.operatingHours.closeTime.errors.invalidFormat,
      }
    );
  });

  readonly isSelectedCoordinates = computed(() => !!this.selectedCoordinates());
  readonly coordinates = computed<CoordinateSummary[]>(() => [
    {
      coordinates: formatCoordinate(this.selectedCoordinates()?.latitude),
      id: "latitude",
      label: "Latitud",
    },
    {
      coordinates: formatCoordinate(this.selectedCoordinates()?.longitude),
      id: "longitude",
      label: "Longitud",
    },
  ]);
  readonly title = computed(() =>
    this.mode() === "create"
      ? APP_TEXTS.parking.form.create.title
      : APP_TEXTS.parking.form.edit.title
  );
  readonly description = computed(() =>
    this.mode() === "create"
      ? APP_TEXTS.parking.form.create.description
      : APP_TEXTS.parking.form.edit.description
  );
  readonly submitButtonText = computed(() =>
    this.mode() === "create"
      ? APP_TEXTS.parking.actions.create
      : APP_TEXTS.parking.actions.edit
  );
  readonly nameError = computed(() =>
    ParkingFormFacade.getFieldError(this.form.name)
  );
  readonly streetError = computed(() =>
    ParkingFormFacade.getFieldError(this.form.address.street)
  );
  readonly cityError = computed(() =>
    ParkingFormFacade.getFieldError(this.form.address.city)
  );
  readonly stateError = computed(() =>
    ParkingFormFacade.getFieldError(this.form.address.state)
  );
  readonly zipCodeError = computed(() =>
    ParkingFormFacade.getFieldError(this.form.address.zipCode)
  );

  constructor() {
    effect(() => {
      const state = this.form.address.state().value();
      this.departments();

      if (!state) {
        this.cities.set([]);
        return;
      }

      this.cities.set(this.colombiaService.getCitiesByDepartmentName(state));
    });
  }

  setMode(mode: ParkingFormMode, id?: string | null): void {
    this.mode.set(mode);
    this.parkingId.set(id ?? null);
  }

  loadModel(model: UpsertParkingLotsModel): void {
    this.form.name().value.set(model.name);
    this.form.address.city().value.set(model.address.city);
    this.form.address.country().value.set(model.address.country);
    this.form.address.state().value.set(model.address.state);
    this.form.address.street().value.set(model.address.street);
    this.form.address.zipCode().value.set(model.address.zipCode ?? "");
    this.form.operatingHours
      .closeTime()
      .value.set(
        ParkingFormFacade.formatOffsetTimeForInput(
          model.operatingHours.closeTime
        )
      );
    this.form.operatingHours
      .openTime()
      .value.set(
        ParkingFormFacade.formatOffsetTimeForInput(
          model.operatingHours.openTime
        )
      );
    this.form.currency().value.set(model.currency);
    this.slots.set(model.slots ?? []);
    this.originalSlots.set(structuredClone(model.slots ?? []));

    if (model.address.state) {
      this.onStateSelected(model.address.state);
    }

    const validCoordinates = ParkingFormFacade.normalizeCoordinates(
      model.coordinates
    );
    this.isMapPlaceholderVisible.set(!validCoordinates);
    if (validCoordinates) {
      this.selectedCoordinates.set(validCoordinates);
    }
  }

  setSubmitting(isSubmitting: boolean): void {
    this.isSubmitting.set(isSubmitting);
  }

  onStateSelected(item: string | null | undefined): void {
    const citiesByDepartment = this.colombiaService.getCitiesByDepartmentName(
      String(item ?? "")
    );
    this.cities.set(citiesByDepartment);
  }

  onCoordinatesChange(coordinates: Coordinates): void {
    this.isMapPlaceholderVisible.set(false);
    this.selectedCoordinates.set(coordinates);
  }

  dismissMapPlaceholder(): void {
    this.isMapPlaceholderVisible.set(false);
  }

  addSlot(): void {
    this.slots.update((slots) => [
      ...slots,
      ParkingFormFacade.createEmptySlot(),
    ]);
  }

  removeSlot(index: number): void {
    const slot = this.slots()[index];
    const id = this.parkingId();
    const isExisting = this.originalSlots().some(
      (s) =>
        s.type === slot.type && s.prefix === slot.prefix && s.zone === slot.zone
    );

    if (this.mode() === "edit" && id && isExisting) {
      this.parkingService.deleteSlotGroup(id, slot).subscribe();
    }

    this.slots.update((slots) => slots.filter((_, i) => i !== index));
  }

  updateSlot<K extends keyof SlotDistribution>(
    index: number,
    field: K,
    value: SlotDistribution[K]
  ): void {
    this.slots.update((slots) =>
      slots.map((slot, currentIndex) =>
        currentIndex === index ? { ...slot, [field]: value } : slot
      )
    );
  }

  buildSubmitModel(): UpsertParkingLotsModel {
    const coordinates = this.selectedCoordinates() ?? {
      latitude: 0,
      longitude: 0,
    };
    const slots = this.slots().filter((slot) => slot.type && slot.count > 0);
    const initial = this.upsertModel();

    return {
      address: {
        city: this.form.address.city().value(),
        country: initial.address.country,
        state: this.form.address.state().value(),
        street: this.form.address.street().value(),
        zipCode: this.form.address.zipCode().value(),
      },
      coordinates,
      currency: initial.currency,
      name: this.form.name().value(),
      operatingHours: {
        closeTime: this.formatInputTimeForOffsetTime(
          this.form.operatingHours.closeTime().value()
        ),
        openTime: this.formatInputTimeForOffsetTime(
          this.form.operatingHours.openTime().value()
        ),
      },
      slots: this.slotsChanged() ? slots : undefined,
      timezone: initial.timezone,
    };
  }

  private static createEmptySlot(): SlotDistribution {
    return {
      count: 0,
      prefix: "",
      type: "CAR",
      zone: "",
    };
  }

  private static formatOffsetTimeForInput(time: string): string {
    const match = time.match(/^(?<hours>\d{2}):(?<minutes>\d{2})/u);
    if (!match?.groups) {
      return "";
    }
    return `${match.groups["hours"]}:${match.groups["minutes"]}`;
  }

  private formatInputTimeForOffsetTime(time: string): string {
    if (!time) {
      return "";
    }

    const [hours = "00", minutes = "00"] = time.split(":");
    const normalizedHours = hours.padStart(2, "0");
    const normalizedMinutes = minutes.padStart(2, "0");
    return `${normalizedHours}:${normalizedMinutes}:00${ParkingFormFacade.timezoneToOffset(this.upsertModel().timezone)}`;
  }

  private static timezoneToOffset(timezone: string): string {
    const match = timezone.match(/^UTC(?<offset>[+-]\d{2}:\d{2})$/u);
    return match?.groups?.["offset"] ?? "-05:00";
  }

  private static normalizeCoordinates(
    coordinates: Coordinates | null | undefined
  ): Coordinates | undefined {
    if (!coordinates) {
      return undefined;
    }

    const latitude = Number(coordinates.latitude);
    const longitude = Number(coordinates.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return undefined;
    }

    return { latitude, longitude };
  }

  private static getFieldError(
    field: FieldTree<string, string>
  ): ValidationError.WithFieldTree[] | undefined {
    if (!field().touched() && field().invalid()) {
      return undefined;
    }
    return field().errors() ?? [];
  }
}
