import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideChevronRight,
  lucideCoins,
  lucideInbox,
  lucidePencil,
  lucidePlus,
  lucideSearch,
  lucideTrash2,
} from '@ng-icons/lucide';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  InputComponent,
  SelectComponent,
  ToastService,
  TypographyH3,
  TypographyMono,
  TypographyMuted,
} from '@nivo-sass/design-system';

import { RateService } from '@core/services/rate-service';
import { ParkingService } from '@core/services/parking-service';
import { RateCalculatorComponent } from '../rate-calculator/rate-calculator';
import { SpecialPoliciesConfigComponent } from '../special-policies-config/special-policies-config';
import { RateDeleteModal } from '../rate-delete-modal/rate-delete-modal';
import { RateModel } from '@core/models/rate.model';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import {
  VEHICLE_FILTER_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from '../../shared/rate-presentations';

@Component({
  selector: 'app-rates-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    InputComponent,
    SelectComponent,
    TypographyH3,
    TypographyMuted,
    TypographyMono,
    RateCalculatorComponent,
    SpecialPoliciesConfigComponent,
    RateDeleteModal,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideChevronRight,
      lucidePlus,
      lucidePencil,
      lucideTrash2,
      lucideCoins,
      lucideInbox,
      lucideSearch,
    }),
  ],
  templateUrl: './rates-list.html',
})
export class RateListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rateService = inject(RateService);
  private readonly parkingService = inject(ParkingService);
  private readonly toast = inject(ToastService);

  protected readonly APP_ROUTES = APP_ROUTES;
  readonly parkingId = signal<string | null>(null);
  readonly activeTab = signal<'rates' | 'calculator' | 'policies'>('rates');
  readonly searchQuery = signal('');
  readonly vehicleFilter = signal<string>('ALL');

  readonly rateToDelete = signal<RateModel | null>(null);
  readonly isDeletingRate = signal<boolean>(false);

  readonly vehicleFilterOptions = VEHICLE_FILTER_OPTIONS;
  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  readonly parking = computed(() => {
    const id = this.parkingId();
    if (!id) return null;
    return (this.parkingService.parkingLots() ?? []).find((lot) => lot.id === id) ?? null;
  });

  readonly allRates = computed(() => {
    const id = this.parkingId();
    if (!id) return [];
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
          r.vehicleType.toLowerCase().includes(query),
      );
    }

    if (vType !== 'ALL') {
      list = list.filter((r) => r.vehicleType === vType);
    }

    return list;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('parkingId');
      this.parkingId.set(id);
      if (id) {
        this.rateService.getRatesByParkingId(id).subscribe();
        this.rateService.loadSpecialPolicies().subscribe();
      }
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onFilterChange(val: any): void {
    this.vehicleFilter.set(val ? String(val) : 'ALL');
  }

  createRate(): void {
    const pId = this.parkingId();
    if (pId) {
      this.router.navigate([`/app/parking-lots/${pId}/rates/new`]);
    }
  }

  editRate(rateId: string): void {
    const pId = this.parkingId();
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
    const pId = this.parkingId();
    if (!rate || !pId) return;

    this.isDeletingRate.set(true);
    this.rateService.deleteRate(rate.id, pId).subscribe({
      next: () => {
        this.isDeletingRate.set(false);
        this.closeDeleteModal();
        this.toast.showToast({ message: 'Tarifa eliminada con éxito', type: 'success' });
      },
      error: () => {
        this.isDeletingRate.set(false);
        this.toast.showToast({ message: 'Error al eliminar la tarifa', type: 'error' });
      },
    });
  }
}
