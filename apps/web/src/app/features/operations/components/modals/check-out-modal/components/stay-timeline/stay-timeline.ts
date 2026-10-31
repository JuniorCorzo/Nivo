import { CommonModule, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideClock, lucideLogOut, lucideTimer } from "@ng-icons/lucide";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

export interface StayDurationResult {
  formatted: string;
  hours: number;
  minutes: number;
  totalMinutes: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, NgIcon],
  providers: [
    provideIcons({
      lucideClock,
      lucideLogOut,
      lucideTimer,
    }),
  ],
  selector: "app-stay-timeline",
  standalone: true,
  templateUrl: "./stay-timeline.html",
})
export class StayTimelineComponent {
  readonly stayDuration = input.required<StayDurationResult>();
  readonly entryTime = input<string | undefined>();
  readonly calculationTime = input.required<Date>();

  readonly texts = APP_TEXTS.operations.checkoutModal.settlement;
}
