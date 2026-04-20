import { Component, computed, effect, input, output, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, exhaustMap, takeUntil } from 'rxjs';
import {
  form,
  required,
  minLength,
  maxLength,
  pattern,
  ValidationError,
  FormField,
} from '@angular/forms/signals';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { ParkingMapComponent } from '../parking-map/parking-map';
import { UpsertParkingLotsModel } from '@core/models/parking.model';
import { Coordinates } from '@core/type/coordinates.type';
import { InputComponent } from '@nivo-sass/design-system';
import { ButtonComponent } from '@nivo-sass/design-system';
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  CardFooterComponent,
} from '@nivo-sass/design-system';
import { TypographyH2 } from '@nivo-sass/design-system';
import { AlertComponent } from '@nivo-sass/design-system';

type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-parking-form',
  standalone: true,
  imports: [
    CommonModule,
    ParkingMapComponent,
    InputComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    TypographyH2,
    AlertComponent,
    FormField,
  ],
  templateUrl: './parking-form.html',
  styleUrl: './parking-form.css',
})
export class ParkingFormComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  readonly APP_TEXTS = APP_TEXTS;
  private readonly fieldTexts = APP_TEXTS.parking.form.fields;

  // Inputs
  readonly mode = input<FormMode>('create');
  readonly model = input<UpsertParkingLotsModel | undefined>(undefined);

  // Outputs
  readonly parkingCreate = output<UpsertParkingLotsModel>();
  readonly parkingUpdate = output<UpsertParkingLotsModel>();

  // Signals for form state
  readonly isSubmitting = signal(false);
  readonly selectedCoordinates = signal<Coordinates | undefined>(undefined);

  // Subject for double-submission prevention
  private readonly submit$ = new Subject<UpsertParkingLotsModel>();

  private upsertModel = signal<UpsertParkingLotsModel>({
    name: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    address: {
      city: '',
      country: '',
      state: '',
      street: '',
      zipCode: '',
    },
    currency: 'COP',
    timezone: 'UTC-5',
    operatingHours: {
      openTime: '',
      closeTime: '',
    },
  });

  // Signal Form with validators
  protected form = form(this.upsertModel, (schemaPath) => {
    required(schemaPath.name, { message: this.fieldTexts.name.errors.required });
    minLength(schemaPath.name, 3, { message: this.fieldTexts.name.errors.minLength });
    maxLength(schemaPath.name, 100, { message: this.fieldTexts.name.errors.maxLength });

    required(schemaPath.address.street, {
      message: this.fieldTexts.address.street.errors.required,
    });
    required(schemaPath.address.city, { message: this.fieldTexts.address.city.errors.required });
    required(schemaPath.address.state, { message: this.fieldTexts.address.state.errors.required });
    required(schemaPath.address.country, {
      message: this.fieldTexts.address.country.errors.required,
    });
    pattern(schemaPath.address.zipCode, /^[0-9]*$/, {
      message: this.fieldTexts.address.zipCode.errors.invalid,
    });

    required(schemaPath.timezone, { message: this.fieldTexts.timezone.errors.required });
    pattern(schemaPath.timezone, /^UTC[+-]\d{1,2}:\d{2}$/, {
      message: this.fieldTexts.timezone.errors.invalid,
    });

    required(schemaPath.currency, { message: this.fieldTexts.currency.errors.required });
    pattern(schemaPath.currency, /^[A-Z]{3}$/, {
      message: this.fieldTexts.currency.errors.invalid,
    });

    required(schemaPath.operatingHours.openTime, {
      message: this.fieldTexts.operatingHours.openTime.errors.required,
    });
    required(schemaPath.operatingHours.closeTime, {
      message: this.fieldTexts.operatingHours.closeTime.errors.required,
    });
  });
  // Computed properties
  readonly title = computed(() =>
    this.mode() === 'create'
      ? this.APP_TEXTS.parking.form.create.title
      : this.APP_TEXTS.parking.form.edit.title,
  );
  readonly description = computed(() =>
    this.mode() === 'create'
      ? this.APP_TEXTS.parking.form.create.description
      : this.APP_TEXTS.parking.form.edit.description,
  );
  readonly submitButtonText = computed(() =>
    this.mode() === 'create'
      ? this.APP_TEXTS.parking.actions.create
      : this.APP_TEXTS.parking.actions.edit,
  );

  constructor() {
    this.initSubmitHandler();
    this.syncWithModel();
  }

  private initSubmitHandler(): void {
    this.submit$
      .pipe(
        exhaustMap((data) => {
          this.isSubmitting.set(true);
          return this.mode() === 'create'
            ? this.emitAndComplete(this.parkingCreate, data)
            : this.emitAndComplete(this.parkingUpdate, data);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        complete: () => this.isSubmitting.set(false),
        error: () => this.isSubmitting.set(false),
      });
  }

  private emitAndComplete<T>(output: any, data: T): Promise<void> {
    return new Promise((resolve) => {
      output.emit(data);
      resolve();
    });
  }

  private syncWithModel(): void {
    effect(() => {
      const model = this.model();
      if (model) {
        this.patchForm(model);
      }
    });
  }

  private patchForm(model: UpsertParkingLotsModel): void {
    this.upsertModel.set({
      name: model.name,
      coordinates: model.coordinates ?? { latitude: 0, longitude: 0 },
      address: {
        city: model.address.city,
        country: model.address.country,
        state: model.address.state,
        street: model.address.street,
        zipCode: model.address.zipCode ?? '',
      },
      currency: model.currency,
      timezone: model.timezone,
      operatingHours: {
        openTime: model.operatingHours.openTime,
        closeTime: model.operatingHours.closeTime,
      },
    });

    if (model.coordinates) {
      this.selectedCoordinates.set(model.coordinates);
    }
  }

  onCoordinatesChange(coordinates: { latitude: number; longitude: number }): void {
    this.selectedCoordinates.set(coordinates);
  }

  onSubmit(): void {
    const currentForm = this.upsertModel();

    const coordinates = this.selectedCoordinates()!;

    this.submit$.next({ ...currentForm, coordinates });
  }

  readonly operatingHoursError = computed(() => {
    const form = this.upsertModel();
    const openTime = this.timeToMinutes(form.operatingHours.openTime);
    const closeTime = this.timeToMinutes(form.operatingHours.closeTime);

    if (closeTime <= openTime && openTime > 0 && closeTime > 0) {
      return this.fieldTexts.operatingHours.closeTime.errors.invalidRange;
    }
    return '';
  });

  // Helper para obtener el primer error de un control
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.submit$.complete();
  }

  onError(path: string): ValidationError.WithFieldTree[] | undefined {
    const segments = path.split('.');
    let node: any = this.form;

    for (const segment of segments) {
      node = node[segment];
      if (!node) return undefined;
    }

    const field = node();
    if (!field.touched() || !field.invalid()) return undefined;

    return field.errors() as ValidationError.WithFieldTree[];
  }
}
