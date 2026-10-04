import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type {
  OperationalReportItemModel,
  ParkingComparisonItemModel,
} from "@core/models/dashboard.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideRadio } from "@ng-icons/lucide";
import {
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { ParkingComparisonChartComponent } from "../parking-comparison-chart/parking-comparison-chart";
import { RecentActivityStreamComponent } from "../recent-activity-stream/recent-activity-stream";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    ParkingComparisonChartComponent,
    RecentActivityStreamComponent,
  ],
  providers: [
    provideIcons({
      lucideRadio,
    }),
  ],
  selector: "app-dashboard-operations-section",
  standalone: true,
  templateUrl: "./dashboard-operations-section.html",
})
export class DashboardOperationsSectionComponent {
  readonly isMultiParkingTenant = input<boolean>(false);
  readonly parkingsComparison = input<ParkingComparisonItemModel[]>([]);
  readonly accessibleParkingsCount = input<number>(0);
  readonly reports = input<OperationalReportItemModel[]>([]);

  readonly parkingSelected = output<string>();

  protected readonly texts = APP_TEXTS.dashboard;
}
