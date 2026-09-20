import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAccessibility,
  lucideAlertCircle,
  lucideCheckCircle2,
  lucideZap,
} from "@ng-icons/lucide";
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
  host: {
    class: "flex flex-col gap-5",
  },
  imports: [NgIcon, InputComponent, SelectComponent],
  providers: [
    provideIcons({
      lucideAccessibility,
      lucideAlertCircle,
      lucideCheckCircle2,
      lucideZap,
    }),
  ],
  selector: "app-parking-slot-edit-form",
  standalone: true,
  templateUrl: "./parking-slot-edit-form.html",
})
export class ParkingSlotEditForm {
  texts = APP_TEXTS.slots;
  slotTypeOptions = SLOT_TYPE_OPTIONS;
  statusOptions = SLOT_STATUS_OPTIONS;
  displayOptionFn = displayOptionFn;
  valueOptionFn = valueOptionFn;

  public readonly facade = inject(ParkingSlotFormFacade);
}
