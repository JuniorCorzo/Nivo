import { Component, inject, OnDestroy } from '@angular/core';
import { Subject, exhaustMap, firstValueFrom, takeUntil } from 'rxjs';
import { FormField } from '@angular/forms/signals';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { UpsertParkingLotsModel } from '@core/models/parking.model';
import { CardComponent, CardContentComponent, CardFooterComponent } from '@nivo-sass/design-system';
import { TypographyH2 } from '@nivo-sass/design-system';
import { ButtonComponent } from '@nivo-sass/design-system';
import { InputComponent, TypographyH3 } from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ParkingService } from '@core/services/parking-service';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { ParkingAddressSectionComponent } from './sections/parking-address-section';
import { ParkingLocationSectionComponent } from './sections/parking-location-section';
import { ParkingOperatingHoursSectionComponent } from './sections/parking-operating-hours-section';
import { ParkingSlotGroupsSectionComponent } from './sections/parking-slot-groups-section';
import { ParkingFormFacade } from './parking-form.facade';

@Component({
  selector: 'app-parking-form',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    CardFooterComponent,
    TypographyH2,
    TypographyH3,
    InputComponent,
    FormField,
    NgIcon,
    RouterLink,
    ParkingAddressSectionComponent,
    ParkingLocationSectionComponent,
    ParkingOperatingHoursSectionComponent,
    ParkingSlotGroupsSectionComponent,
  ],
  providers: [provideIcons({ lucideArrowLeft }), ParkingFormFacade],
  templateUrl: './parking-form.html',
  styleUrl: './parking-form.css',
})
export class ParkingFormComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parkingService = inject(ParkingService);

  protected readonly APP_TEXTS = APP_TEXTS;
  protected readonly facade = inject(ParkingFormFacade);
  protected readonly parkingId = this.route.snapshot.paramMap.get('parkingId');

  // Subject for double-submission prevention
  private readonly submit$ = new Subject<UpsertParkingLotsModel>();

  constructor() {
    this.initSubmitHandler();
    this.syncFacadeWithInputs();
  }

  private initSubmitHandler(): void {
    this.submit$
      .pipe(
        exhaustMap(async (data) => {
          this.facade.setSubmitting(true);
          try {
            if (this.parkingId) {
              await firstValueFrom(this.parkingService.update({ ...data, id: this.parkingId }));
            } else {
              await firstValueFrom(this.parkingService.create(data));
            }

            await this.router.navigate([APP_ROUTES.app.parkingLots]);
          } finally {
            return this.facade.setSubmitting(false);
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private syncFacadeWithInputs(): void {
    this.facade.setMode(this.parkingId ? 'edit' : 'create', this.parkingId);

    if (!this.parkingId) {
      return;
    }

    this.parkingService
      .getUpsertById(this.parkingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((model) => this.facade.loadModel(model));
  }

  onSubmit(): void {
    this.submit$.next(this.facade.buildSubmitModel());
  }
  onCancel(): void {
    this.router.navigate([APP_ROUTES.app.parkingLots]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.submit$.complete();
  }
}
