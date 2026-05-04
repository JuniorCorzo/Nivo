import { computed, effect, Injectable, signal, inject } from '@angular/core';
import {
  disabled,
  FieldTree,
  form,
  maxLength,
  minLength,
  pattern,
  required,
  ValidationError,
} from '@angular/forms/signals';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { UpsertParkingLotsModel } from '@core/models/parking.model';
import { Coordinates } from '@core/type/coordinates.type';
import { SlotDistribution, SlotType } from '@core/type/slot-distribution.type';
import { ColombiaService } from '@/app/core/service/colombia-service';
import { ParkingService } from '@core/services/parking-service';

export type ParkingFormMode = 'create' | 'edit';

@Injectable()
export class ParkingFormFacade {
  private readonly colombiaService = inject(ColombiaService);
  private readonly parkingService = inject(ParkingService);
  private readonly fieldTexts = APP_TEXTS.parking.form.fields;

  readonly mode = signal<ParkingFormMode>('create');
  readonly parkingId = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly selectedCoordinates = signal<Coordinates | undefined>(undefined);
  readonly isMapPlaceholderVisible = signal(true);
  readonly departments = this.colombiaService.departaments;
  readonly cities = signal<string[]>([]);
  readonly slots = signal<SlotDistribution[]>([]);
  private readonly originalSlots = signal<SlotDistribution[]>([]);
  readonly slotsChanged = computed(
    () => JSON.stringify(this.originalSlots()) !== JSON.stringify(this.slots()),
  );
  readonly slotTypeOptions: { value: SlotType; label: string }[] = [
    { value: 'CAR', label: 'Carro' },
    { value: 'MOTORCYCLE', label: 'Moto' },
    { value: 'BIKE', label: 'Bicicleta' },
    { value: 'ELECTRIC_VEHICLE', label: 'Vehículo eléctrico' },
    { value: 'DISABLED', label: 'Discapacitados' },
  ];

  readonly upsertModel = signal<UpsertParkingLotsModel>({
    name: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    address: {
      city: '',
      country: 'Colombia',
      state: '',
      street: '',
      zipCode: '',
    },
    currency: 'COP',
    timezone: 'UTC-05:00',
    operatingHours: {
      openTime: '',
      closeTime: '',
    },
  });

  readonly form = form(this.upsertModel, (schemaPath) => {
    required(schemaPath.name, { message: this.fieldTexts.name.errors.required });
    minLength(schemaPath.name, 3, { message: this.fieldTexts.name.errors.minLength });
    maxLength(schemaPath.name, 100, { message: this.fieldTexts.name.errors.maxLength });

    required(schemaPath.address.street, {
      message: this.fieldTexts.address.street.errors.required,
    });
    disabled(schemaPath.address.city, () => this.cities().length === 0);
    required(schemaPath.address.city, { message: this.fieldTexts.address.city.errors.required });
    required(schemaPath.address.state, { message: this.fieldTexts.address.state.errors.required });
    pattern(schemaPath.address.zipCode, /^[0-9]*$/, {
      message: this.fieldTexts.address.zipCode.errors.invalid,
    });

    required(schemaPath.operatingHours.openTime, {
      message: this.fieldTexts.operatingHours.openTime.errors.required,
    });
    pattern(schemaPath.operatingHours.openTime, /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: this.fieldTexts.operatingHours.openTime.errors.invalidFormat,
    });
    required(schemaPath.operatingHours.closeTime, {
      message: this.fieldTexts.operatingHours.closeTime.errors.required,
    });
    pattern(schemaPath.operatingHours.closeTime, /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: this.fieldTexts.operatingHours.closeTime.errors.invalidFormat,
    });
  });

  readonly isSelectedCoordinates = computed(() => !!this.selectedCoordinates());
  readonly coordinates = computed(() => [
    {
      label: 'Latitud',
      coordinates: this.formatCoordinates(this.selectedCoordinates()?.latitude),
    },
    {
      label: 'Longitud',
      coordinates: this.formatCoordinates(this.selectedCoordinates()?.longitude),
    },
  ]);
  readonly title = computed(() =>
    this.mode() === 'create'
      ? APP_TEXTS.parking.form.create.title
      : APP_TEXTS.parking.form.edit.title,
  );
  readonly description = computed(() =>
    this.mode() === 'create'
      ? APP_TEXTS.parking.form.create.description
      : APP_TEXTS.parking.form.edit.description,
  );
  readonly submitButtonText = computed(() =>
    this.mode() === 'create' ? APP_TEXTS.parking.actions.create : APP_TEXTS.parking.actions.edit,
  );
  readonly nameError = computed(() => this.getFieldError(this.form.name));
  readonly streetError = computed(() => this.getFieldError(this.form.address.street));
  readonly cityError = computed(() => this.getFieldError(this.form.address.city));
  readonly stateError = computed(() => this.getFieldError(this.form.address.state));
  readonly zipCodeError = computed(() => this.getFieldError(this.form.address.zipCode));

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

  loadModel(model: UpsertParkingLotsModel | undefined): void {
    if (!model) return;

    const validCoordinates = this.normalizeCoordinates(model.coordinates);
    const openTime = this.formatOffsetTimeForInput(model.operatingHours?.openTime ?? '');
    const closeTime = this.formatOffsetTimeForInput(model.operatingHours?.closeTime ?? '');

    this.form.name().value.set(model.name);
    this.form.address.street().value.set(model.address.street);
    this.form.address.state().value.set(model.address.state);
    this.form.address.city().value.set(model.address.city);
    this.form.address.zipCode().value.set(model.address.zipCode ?? '');
    this.form.operatingHours.openTime().value.set(openTime);
    this.form.operatingHours.closeTime().value.set(closeTime);

    const slots = model.slots ?? [];
    this.slots.set(slots);
    this.originalSlots.set(structuredClone(slots));
    this.isMapPlaceholderVisible.set(!validCoordinates);

    if (validCoordinates) {
      this.selectedCoordinates.set(validCoordinates);
    }
  }

  setSubmitting(isSubmitting: boolean): void {
    this.isSubmitting.set(isSubmitting);
  }

  onStateSelected(item: unknown): void {
    const citiesByDepartment = this.colombiaService.getCitiesByDepartmentName(String(item));
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
    this.slots.update((slots) => [...slots, this.createEmptySlot()]);
  }

  removeSlot(index: number): void {
    const slot = this.slots()[index];
    const id = this.parkingId();
    const isExisting = this.originalSlots().some(
      (s) => s.type === slot.type && s.prefix === slot.prefix && s.zone === slot.zone,
    );

    if (this.mode() === 'edit' && id && isExisting) {
      this.parkingService.deleteSlotGroup(id, slot).subscribe();
    }

    this.slots.update((slots) => slots.filter((_, i) => i !== index));
  }

  updateSlot<K extends keyof SlotDistribution>(
    index: number,
    field: K,
    value: SlotDistribution[K],
  ): void {
    this.slots.update((slots) =>
      slots.map((slot, currentIndex) =>
        currentIndex === index ? { ...slot, [field]: value } : slot,
      ),
    );
  }

  buildSubmitModel(): UpsertParkingLotsModel {
    const coordinates = this.selectedCoordinates()!;
    const slots = this.slots().filter((slot) => slot.type && slot.count > 0);
    const initial = this.upsertModel();

    return {
      name: this.form.name().value(),
      coordinates,
      address: {
        city: this.form.address.city().value(),
        country: initial.address.country,
        state: this.form.address.state().value(),
        street: this.form.address.street().value(),
        zipCode: this.form.address.zipCode().value(),
      },
      currency: initial.currency,
      timezone: initial.timezone,
      operatingHours: {
        openTime: this.formatInputTimeForOffsetTime(this.form.operatingHours.openTime().value()),
        closeTime: this.formatInputTimeForOffsetTime(this.form.operatingHours.closeTime().value()),
      },
      slots: this.slotsChanged() ? slots : undefined,
    };
  }

  private createEmptySlot(): SlotDistribution {
    return {
      prefix: '',
      zone: '',
      type: 'CAR',
      count: 0,
    };
  }

  private formatOffsetTimeForInput(time: string): string {
    const match = time.match(/^(\d{2}):(\d{2})/);
    if (!match) return '';
    return `${match[1]}:${match[2]}`;
  }

  private formatInputTimeForOffsetTime(time: string): string {
    if (!time) return '';

    const [hours = '00', minutes = '00'] = time.split(':');
    const normalizedHours = hours.padStart(2, '0');
    const normalizedMinutes = minutes.padStart(2, '0');
    return `${normalizedHours}:${normalizedMinutes}:00${this.timezoneToOffset(this.upsertModel().timezone)}`;
  }

  private timezoneToOffset(timezone: string): string {
    const match = timezone.match(/^UTC([+-]\d{2}:\d{2})$/);
    return match?.[1] ?? '-05:00';
  }

  private formatCoordinates(coordinate: number | undefined): string | undefined {
    return coordinate
      ? new Intl.NumberFormat('es-co', { style: 'decimal', minimumFractionDigits: 4 }).format(
          coordinate,
        )
      : undefined;
  }

  private normalizeCoordinates(coordinates: Coordinates | undefined): Coordinates | undefined {
    if (!coordinates) return undefined;

    const { latitude, longitude } = coordinates as Coordinates & {
      latitude: number | null;
      longitude: number | null;
    };

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return undefined;
    }

    return { latitude, longitude };
  }

  private getFieldError(
    field: FieldTree<string, string>,
  ): ValidationError.WithFieldTree[] | undefined {
    if (!field().touched() && field().invalid()) return undefined;
    return field().errors() ?? [];
  }
}
