import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideFilterX, lucideInbox, lucidePlus } from "@ng-icons/lucide";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideFilterX,
      lucideInbox,
      lucidePlus,
    }),
  ],
  selector: "app-slot-empty-state",
  standalone: true,
  templateUrl: "./slot-empty-state.html",
})
export class SlotEmptyStateComponent {
  readonly hasSlots = input.required<boolean>();

  readonly create = output();
  readonly clearFilters = output();
}
