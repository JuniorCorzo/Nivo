import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { OperationalReportItemModel } from "@core/models/dashboard.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideDownload } from "@ng-icons/lucide";
import {
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { OperationalReportsTableComponent } from "../operational-reports-table/operational-reports-table";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    OperationalReportsTableComponent,
  ],
  providers: [
    provideIcons({
      lucideDownload,
    }),
  ],
  selector: "app-dashboard-reports-section",
  standalone: true,
  templateUrl: "./dashboard-reports-section.html",
})
export class DashboardReportsSectionComponent {
  readonly reports = input<OperationalReportItemModel[]>([]);
  readonly isGlobalScope = input<boolean>(false);
  readonly page = input<number>(0);
  readonly totalPages = input<number>(0);

  readonly pageChange = output<number>();
  readonly exportCsv = output();

  protected readonly texts = APP_TEXTS.dashboard;
  protected readonly dataTableTexts = APP_TEXTS.dataTable;
}
