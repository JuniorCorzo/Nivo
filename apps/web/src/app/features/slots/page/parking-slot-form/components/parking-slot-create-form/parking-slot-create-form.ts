import { ChangeDetectionStrategy, Component, input, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertCircle, lucideSparkles } from "@ng-icons/lucide";
import { InputComponent, SelectComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { ParkingSlotFormFacade } from "../../../../facades/parking-slot-form.facade";
import {
  SLOT_STATUS_OPTIONS,
  SLOT_TYPE_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from "../../../../shared/parking-slot-presentations";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, InputComponent, SelectComponent],
  providers: [provideIcons({ lucideAlertCircle, lucideSparkles })],
  selector: "app-parking-slot-create-form",
  standalone: true,
  templateUrl: "./parking-slot-create-form.html",
})
export class ParkingSlotCreateForm {
  parkingName = input.required<string>();

  texts = APP_TEXTS.slots;
  TYPE_OPTIONS = SLOT_TYPE_OPTIONS;
  STATUS_OPTIONS = SLOT_STATUS_OPTIONS;
  displayFn = displayOptionFn;
  valueFn = valueOptionFn;

  public readonly facade = inject(ParkingSlotFormFacade);
}
