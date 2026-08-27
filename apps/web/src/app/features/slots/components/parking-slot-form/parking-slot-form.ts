import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucidePlus, lucideSave, lucideSparkles, lucideLayers, lucideAlertCircle } from '@ng-icons/lucide';
import {
  ButtonComponent,
  InputComponent,
  SelectComponent,
} from '@nivo-sass/design-system';

import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import {
  SLOT_STATUS_OPTIONS,
  SLOT_TYPE_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from '../../shared/parking-slot-presentations';
import { ParkingSlotFormFacade } from './parking-slot-form.facade';

@Component({
  selector: 'app-parking-slot-form',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    ButtonComponent,
    InputComponent,
    SelectComponent,
  ],
  providers: [
    provideIcons({ lucideArrowLeft, lucidePlus, lucideSave, lucideSparkles, lucideLayers, lucideAlertCircle }),
    ParkingSlotFormFacade,
  ],
  templateUrl: './parking-slot-form.html',
  host: {
    class: 'block',
  },
})
export class ParkingSlotFormPage {
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly facade = inject(ParkingSlotFormFacade);
  protected readonly texts = APP_TEXTS.slots;

  protected readonly slotTypeOptions = SLOT_TYPE_OPTIONS;
  protected readonly statusOptions = SLOT_STATUS_OPTIONS;
  protected readonly displayOptionFn = displayOptionFn;
  protected readonly valueOptionFn = valueOptionFn;
}
