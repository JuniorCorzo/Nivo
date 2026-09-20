import type { OnInit } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideFilterX, lucideRotateCcw, lucideSearch } from "@ng-icons/lucide";
import {
  ButtonComponent,
  InputComponent,
  SelectComponent,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";

import type {
  TicketFilterCriteria,
  TicketStatusFilter,
} from "../../models/ticket-filter.model";

export interface FilterSelectOption<T = string> {
  label: string;
  value: T;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent, SelectComponent, ButtonComponent, NgIcon],
  providers: [
    provideIcons({
      lucideFilterX,
      lucideRotateCcw,
      lucideSearch,
    }),
  ],
  selector: "app-ticket-filters",
  standalone: true,
  templateUrl: "./ticket-filters.html",
})
export class TicketFiltersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly plateSubject = new Subject<string>();

  readonly texts = APP_TEXTS.tickets.filters;

  readonly filters = input.required<TicketFilterCriteria>();
  readonly showParkingLotFilter = input<boolean>(false);
  readonly parkingLots = input<ParkingLotListItemModel[]>([]);

  readonly filtersChange = output<TicketFilterCriteria>();
  readonly reset = output();

  readonly parkingLotOptions = computed<FilterSelectOption[]>(() => [
    { label: this.texts.parkingLot.all, value: "ALL" },
    ...this.parkingLots().map((lot) => ({
      label: lot.name,
      value: lot.id,
    })),
  ]);

  readonly statusOptions: FilterSelectOption<TicketStatusFilter>[] = [
    { label: APP_TEXTS.tickets.filters.status.all, value: "ALL" },
    { label: APP_TEXTS.tickets.filters.status.open, value: "OPEN" },
    { label: APP_TEXTS.tickets.filters.status.closed, value: "CLOSED" },
  ];

  readonly vehicleOptions: FilterSelectOption<string>[] = [
    { label: APP_TEXTS.tickets.filters.vehicle.all, value: "ALL" },
    { label: APP_TEXTS.tickets.filters.vehicle.car, value: "CAR" },
    {
      label: APP_TEXTS.tickets.filters.vehicle.motorcycle,
      value: "MOTORCYCLE",
    },
    { label: APP_TEXTS.tickets.filters.vehicle.bicycle, value: "BICYCLE" },
  ];

  static displayOptionFn(opt: FilterSelectOption): string {
    return opt?.label ?? "";
  }

  static valueOptionFn(opt: FilterSelectOption): string {
    return opt?.value ?? "";
  }

  readonly displayOptionFn = TicketFiltersComponent.displayOptionFn;
  readonly valueOptionFn = TicketFiltersComponent.valueOptionFn;

  ngOnInit(): void {
    this.plateSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((plate) => {
        this.filtersChange.emit({
          ...this.filters(),
          plate,
        });
      });
  }

  onPlateInput(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.plateSubject.next(target.value);
    }
  }

  onParkingLotChange(val: string): void {
    if (!val) {
      return;
    }
    this.filtersChange.emit({
      ...this.filters(),
      parkingLotId: val,
    });
  }

  onStatusChange(val: string): void {
    if (!val) {
      return;
    }
    this.filtersChange.emit({
      ...this.filters(),
      /* SAFETY: val is selected from statusOptions which only contains TicketStatusFilter values */
      status: val as TicketStatusFilter,
    });
  }

  onVehicleChange(val: string): void {
    if (!val) {
      return;
    }
    this.filtersChange.emit({
      ...this.filters(),
      vehicleType: val,
    });
  }

  onReset(): void {
    this.reset.emit();
  }
}
