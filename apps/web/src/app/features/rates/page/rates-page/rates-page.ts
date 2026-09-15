import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowLeft, lucideCoins, lucidePlus } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { PageHeaderComponent } from "@shared/components/page-header/page-header.component";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { RateCalculatorComponent } from "../../components/rate-calculator/rate-calculator";
import { RateListComponent } from "../../components/rates-list/rates-list";
import { SpecialPoliciesConfigComponent } from "../../components/special-policies-config/special-policies-config";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgIcon,
    ButtonComponent,
    PageHeaderComponent,
    RateListComponent,
    RateCalculatorComponent,
    SpecialPoliciesConfigComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCoins,
      lucidePlus,
    }),
  ],
  selector: "app-rates-page",
  standalone: true,
  templateUrl: "./rates-page.html",
})
export class RatesPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rateService = inject(RateService);
  private readonly parkingService = inject(ParkingService);

  protected readonly APP_ROUTES = APP_ROUTES;
  readonly parkingId = signal<string | null>(null);
  readonly activeTab = signal<"rates" | "calculator" | "policies">("rates");

  readonly parking = computed(() => {
    const id = this.parkingId();
    if (!id) {
      return null;
    }
    return (
      (this.parkingService.parkingLots() ?? []).find((lot) => lot.id === id) ??
      null
    );
  });

  readonly allRates = computed(() => {
    const id = this.parkingId();
    if (!id) {
      return [];
    }
    return this.rateService.ratesByParking()[id] ?? [];
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get("parkingId");
      this.parkingId.set(id);
      if (id) {
        this.rateService.getRatesByParkingId(id).subscribe();
        this.rateService.loadSpecialPolicies().subscribe();
      }
    });
  }

  createRate(): void {
    const pId = this.parkingId();
    if (pId) {
      this.router.navigate([`/app/parking-lots/${pId}/rates/new`]);
    }
  }
}
