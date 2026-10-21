import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { ParkingItem, ScopeState } from "@core/models/dashboard.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideBuilding2, lucideCar, lucideRefreshCw } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import type { PageHeaderBreadcrumbItem } from "@shared/components/page-header/page-header";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import type { TimeGranularity } from "../../facade/dashboard.facade";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, ButtonComponent, NgIcon],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideCar,
      lucideRefreshCw,
    }),
  ],
  selector: "app-dashboard-header",
  standalone: true,
  templateUrl: "./dashboard-header.html",
})
export class DashboardHeaderComponent {
  readonly breadcrumbs = input<PageHeaderBreadcrumbItem[]>([]);
  readonly timeGranularity = input<TimeGranularity>("today");
  readonly accessibleParkings = input<ParkingItem[]>([]);
  readonly isMultiParkingTenant = input<boolean>(false);
  readonly activeScope = input<ScopeState>({ mode: "GLOBAL" });

  readonly granularityChange = output<TimeGranularity>();
  readonly refreshTelemetry = output();
  readonly scopeChange = output<{
    mode: "GLOBAL" | "SINGLE";
    parkingId?: string;
  }>();

  protected readonly texts = APP_TEXTS.dashboard;
}
