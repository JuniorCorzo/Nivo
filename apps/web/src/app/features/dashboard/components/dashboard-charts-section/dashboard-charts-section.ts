import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type {
  DashboardSummaryModel,
  HourlyOccupancyPointModel,
} from "@core/models/dashboard.model";
import {
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import type { TimeGranularity } from "../../facade/dashboard.facade";
import { OccupancyTrendChartComponent } from "../occupancy-trend-chart/occupancy-trend-chart";
import { SlotDistributionDonutChartComponent } from "../slot-distribution-donut-chart/slot-distribution-donut-chart";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    OccupancyTrendChartComponent,
    SlotDistributionDonutChartComponent,
  ],
  selector: "app-dashboard-charts-section",
  standalone: true,
  templateUrl: "./dashboard-charts-section.html",
})
export class DashboardChartsSectionComponent {
  readonly title = input<string>("");
  readonly subtitle = input<string>("");
  readonly hourlyOccupancy = input<HourlyOccupancyPointModel[]>([]);
  readonly timeGranularity = input<TimeGranularity>("today");
  readonly summary = input<DashboardSummaryModel | null>(null);

  protected readonly texts = APP_TEXTS.dashboard;
}
