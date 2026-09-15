import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import type { RateModel } from "@core/models/rate.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBike,
  lucideCar,
  lucideCoins,
  lucidePencil,
  lucidePlus,
  lucideSearch,
  lucideTrash2,
} from "@ng-icons/lucide";
import {
  InputComponent,
  SelectComponent,
  ToastService,
} from "@nivo-sass/design-system";

import {
  VEHICLE_FILTER_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from "../../shared/rate-presentations";
import { RateDeleteModal } from "../rate-delete-modal/rate-delete-modal";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgIcon,
    InputComponent,
    SelectComponent,
    RateDeleteModal,
  ],
  providers: [
    provideIcons({
      lucideBike,
      lucideCar,
      lucideCoins,
      lucidePencil,
      lucidePlus,
      lucideSearch,
      lucideTrash2,
    }),
  ],
  selector: "app-rates-list",
  standalone: true,
  templateUrl: "./rates-list.html",
})
export class RateListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rateService = inject(RateService);
  private readonly parkingService = inject(ParkingService);
  private readonly toast = inject(ToastService);

  readonly parkingIdInput = input<string | null>(null, { alias: "parkingId" });
  readonly routeParkingId = signal<string | null>(null);

  readonly effectiveParkingId = computed(
    () => this.parkingIdInput() ?? this.routeParkingId()
  );

  readonly searchQuery = signal("");
  readonly vehicleFilter = signal<string>("ALL");

  readonly rateToDelete = signal<RateModel | null>(null);
  readonly isDeletingRate = signal<boolean>(false);

  readonly vehicleFilterOptions = VEHICLE_FILTER_OPTIONS;
  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  readonly parking = computed(() => {
    const id = this.effectiveParkingId();
    if (!id) {
      return null;
    }
    return (
      (this.parkingService.parkingLots() ?? []).find((lot) => lot.id === id) ??
      null
    );
  });

  readonly allRates = computed(() => {
    const id = this.effectiveParkingId();
    if (!id) {
      return [];
    }
    return this.rateService.ratesByParking()[id] ?? [];
  });

  readonly filteredRates = computed(() => {
    let list = this.allRates();
    const query = this.searchQuery().trim().toLowerCase();
    const vType = this.vehicleFilter();

    if (query) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.vehicleType.toLowerCase().includes(query)
      );
    }

    if (vType !== "ALL") {
      list = list.filter((r) => r.vehicleType === vType);
    }

    return list;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get("parkingId");
      this.routeParkingId.set(id);
      if (id) {
        this.rateService.getRatesByParkingId(id).subscribe();
        this.rateService.loadSpecialPolicies().subscribe();
      }
    });
  }

  onSearchInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onFilterChange(val: string | null | undefined): void {
    this.vehicleFilter.set(val ? String(val) : "ALL");
  }

  createRate(): void {
    const pId = this.effectiveParkingId();
    if (pId) {
      this.router.navigate([`/app/parking-lots/${pId}/rates/new`]);
    }
  }

  editRate(rateId: string): void {
    const pId = this.effectiveParkingId();
    if (pId) {
      this.router.navigate([`/app/parking-lots/${pId}/rates/${rateId}/edit`]);
    }
  }

  openDeleteModal(rate: RateModel): void {
    this.rateToDelete.set(rate);
  }

  closeDeleteModal(): void {
    this.rateToDelete.set(null);
  }

  confirmDelete(): void {
    const rate = this.rateToDelete();
    const pId = this.effectiveParkingId();
    if (!rate || !pId) {
      return;
    }

    this.isDeletingRate.set(true);
    this.rateService.deleteRate(rate.id, pId).subscribe({
      error: () => {
        this.isDeletingRate.set(false);
        this.toast.showToast({
          message: "Error al eliminar la tarifa",
          type: "error",
        });
      },
      next: () => {
        this.isDeletingRate.set(false);
        this.closeDeleteModal();
        this.toast.showToast({
          message: "Tarifa eliminada con éxito",
          type: "success",
        });
      },
    });
  }
}
