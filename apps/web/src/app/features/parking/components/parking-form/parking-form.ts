import type { OnDestroy } from "@angular/core";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormField } from "@angular/forms/signals";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import type { UpsertParkingLotsModel } from "@core/models/parking.model";
import { ParkingService } from "@core/services/parking-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowLeft,
  lucideSave,
  lucideLoader2,
  lucideBuilding2,
  lucideMapPin,
} from "@ng-icons/lucide";
import { InputComponent } from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { Subject, exhaustMap, firstValueFrom, takeUntil } from "rxjs";

import { ParkingFormFacade } from "./parking-form.facade";
import { ParkingAddressSectionComponent } from "./sections/parking-address-section";
import { ParkingLocationSectionComponent } from "./sections/parking-location-section";
import { ParkingOperatingHoursSectionComponent } from "./sections/parking-operating-hours-section";
import { ParkingSlotGroupsSectionComponent } from "./sections/parking-slot-groups-section";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputComponent,
    FormField,
    NgIcon,
    RouterLink,
    ParkingAddressSectionComponent,
    ParkingLocationSectionComponent,
    ParkingOperatingHoursSectionComponent,
    ParkingSlotGroupsSectionComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideBuilding2,
      lucideLoader2,
      lucideMapPin,
      lucideSave,
    }),
    ParkingFormFacade,
  ],
  selector: "app-parking-form",
  standalone: true,
  styleUrl: "./parking-form.css",
  templateUrl: "./parking-form.html",
})
export class ParkingFormComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parkingService = inject(ParkingService);

  protected readonly APP_TEXTS = APP_TEXTS;
  protected readonly facade = inject(ParkingFormFacade);
  protected readonly parkingId = this.route.snapshot.paramMap.get("parkingId");

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
            const save$ = this.parkingId
              ? this.parkingService.update({ ...data, id: this.parkingId })
              : this.parkingService.create(data);
            await firstValueFrom(save$);

            await this.router.navigate([APP_ROUTES.app.parkingLots]);
          } finally {
            this.facade.setSubmitting(false);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private syncFacadeWithInputs(): void {
    this.facade.setMode(this.parkingId ? "edit" : "create", this.parkingId);

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
