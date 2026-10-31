import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { SlotSummary } from "@core/models/slot.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowRight } from "@ng-icons/lucide";
import { BadgeComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, NgIcon],
  providers: [provideIcons({ lucideArrowRight })],
  selector: "app-occupied-slot-card",
  standalone: true,
  templateUrl: "./occupied-slot-card.html",
})
export class OccupiedSlotCardComponent {
  readonly slot = input.required<SlotSummary>();
  readonly selected = output<SlotSummary>();

  readonly texts = APP_TEXTS.operations.checkoutModal;
}
