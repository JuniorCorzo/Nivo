import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowLeft,
  lucidePlus,
  lucideSave,
  lucideSparkles,
  lucideLayers,
  lucideAlertCircle,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  InputComponent,
  SelectComponent,
  TypographyH1,
} from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { ParkingSlotFormFacade } from "../../facades/parking-slot-form.facade";
import {
  SLOT_STATUS_OPTIONS,
  SLOT_TYPE_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from "../../shared/parking-slot-presentations";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block",
  },
  imports: [
    RouterLink,
    NgIcon,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TypographyH1,
  ],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideArrowLeft,
      lucideLayers,
      lucidePlus,
      lucideSave,
      lucideSparkles,
    }),
    ParkingSlotFormFacade,
  ],
  selector: "app-parking-slot-form",
  standalone: true,
  templateUrl: "./parking-slot-form.html",
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
