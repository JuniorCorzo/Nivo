import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { provideIcons, NgIcon } from "@ng-icons/core";
import {
  lucideAccessibility,
  lucidePlugZap2,
  lucideSearch,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  InputComponent,
  SelectComponent,
  TypographyMuted,
  TypographySpan,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import type { Option } from "../../../shared/parking-slot-presentations";
import {
  SLOT_STATUS_FILTER_OPTIONS,
  SLOT_TYPE_FILTER_OPTIONS,
  SLOT_ZONE_FILTER_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from "../../../shared/parking-slot-presentations";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputComponent,
    SelectComponent,
    ButtonComponent,
    NgIcon,
    TypographyMuted,
    TypographySpan,
  ],
  providers: [
    provideIcons({ lucideAccessibility, lucidePlugZap2, lucideSearch }),
  ],
  selector: "app-slot-filter-toolbar",
  standalone: true,
  templateUrl: "./slot-filter-toolbar.html",
})
export class SlotFilterToolbarComponent {
  readonly globalFilter = input<string>("");
  readonly typeFilter = input<string>("");
  readonly zoneFilter = input<string>("");
  readonly statusFilter = input<string>("");
  readonly isAccessibleFilter = input<boolean>(false);
  readonly hasChargerFilter = input<boolean>(false);

  readonly typeOptions = input<Option[]>(SLOT_TYPE_FILTER_OPTIONS);
  readonly zoneOptions = input<Option[]>(SLOT_ZONE_FILTER_OPTIONS);
  readonly statusOptions = input<Option[]>(SLOT_STATUS_FILTER_OPTIONS);
  readonly placeholder = input<string>(
    APP_TEXTS.parking.slots.list.search.placeholder
  );

  readonly queryInput = output<Event>();
  readonly filterChange = output<{ key: string; value: unknown }>();
  readonly clearFilters = output();

  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  onFilterChange(key: string, value: unknown): void {
    this.filterChange.emit({ key, value });
  }

  toggleAccessible(): void {
    const next = this.isAccessibleFilter() === true ? undefined : true;
    this.filterChange.emit({ key: "isAccessible", value: next });
  }

  toggleCharger(): void {
    const next = this.hasChargerFilter() === true ? undefined : true;
    this.filterChange.emit({ key: "hasCharger", value: next });
  }
}
