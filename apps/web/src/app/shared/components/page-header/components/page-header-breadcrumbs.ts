import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowLeft,
  lucideBuilding2,
  lucideCar,
  lucideChevronRight,
  lucideCoins,
  lucideEdit,
  lucideHome,
  lucideLayers,
  lucideLayoutDashboard,
  lucideLayoutGrid,
  lucideParkingSquare,
  lucidePlus,
  lucideSettings,
  lucideSliders,
  lucideSquare,
  lucideSquareDashed,
  lucideTicket,
} from "@ng-icons/lucide";

import type { PageHeaderBreadcrumbItem } from "../page-header";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideBuilding2,
      lucideCar,
      lucideChevronRight,
      lucideCoins,
      lucideEdit,
      lucideHome,
      lucideLayers,
      lucideLayoutDashboard,
      lucideLayoutGrid,
      lucideParkingSquare,
      lucidePlus,
      lucideSettings,
      lucideSliders,
      lucideSquare,
      lucideSquareDashed,
      lucideTicket,
    }),
  ],
  selector: "app-page-header-breadcrumbs",
  standalone: true,
  templateUrl: "./page-header-breadcrumbs.html",
})
export class PageHeaderBreadcrumbsComponent {
  readonly breadcrumbs = input.required<PageHeaderBreadcrumbItem[]>();
}
