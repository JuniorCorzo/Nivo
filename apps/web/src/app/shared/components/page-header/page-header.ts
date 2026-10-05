import { Location } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { NavigationContextService } from "@core/services/navigation-context.service";
import { ParkingLotSelector } from "@features/parking/components/controls/parking-lot-selector/parking-lot-selector";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowLeft,
  lucideBuilding2,
  lucideCar,
  lucideChevronLeft,
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
import {
  BadgeComponent,
  DividerComponent,
  TypographyH1,
  TypographyMuted,
} from "@nivo-sass/design-system";

import { PageHeaderBreadcrumbsComponent } from "./components/page-header-breadcrumbs";
import { PageHeaderHistoryComponent } from "./components/page-header-history";
import { PageHeaderMobileBarComponent } from "./components/page-header-mobile-bar";

export type PageHeaderBadgeVariant =
  | "info"
  | "success"
  | "warning"
  | "destructive"
  | "secondary";

export interface PageHeaderBreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
  isParking?: boolean;
}

const resolveBreadcrumbIcon = (item: PageHeaderBreadcrumbItem): string => {
  if (item.icon) {
    return item.icon;
  }
  if (item.url === "/app" || item.label.toLowerCase() === "home") {
    return "lucideHome";
  }
  if (item.isParking) {
    return "lucideBuilding2";
  }
  const lower = item.label.toLowerCase();
  if (lower.includes("parqueadero") || lower.includes("sede")) {
    return "lucideParkingSquare";
  }
  if (lower.includes("plaza")) {
    return "lucideLayoutGrid";
  }
  if (lower.includes("tarifa")) {
    return "lucideCoins";
  }
  if (lower.includes("operaci")) {
    return "lucideCar";
  }
  if (lower.includes("ticket")) {
    return "lucideTicket";
  }
  return "lucideLayoutDashboard";
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block w-full",
  },
  imports: [
    NgIcon,
    BadgeComponent,
    TypographyH1,
    TypographyMuted,
    PageHeaderHistoryComponent,
    PageHeaderBreadcrumbsComponent,
    PageHeaderMobileBarComponent,
    DividerComponent,
    ParkingLotSelector,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideBuilding2,
      lucideCar,
      lucideChevronLeft,
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
  selector: "app-page-header",
  standalone: true,
  styleUrl: "./page-header.css",
  templateUrl: "./page-header.html",
})
export class PageHeaderComponent {
  private readonly location = inject(Location);
  private readonly navigationContextService = inject(NavigationContextService, {
    optional: true,
  });

  readonly title = input<string>("");
  readonly showParkingSelector = input<boolean>(false);
  readonly subtitle = input<string | null>(null);
  readonly badge = input<string | null>(null);
  readonly badgeVariant = input<PageHeaderBadgeVariant>("info");
  readonly breadcrumbs = input<PageHeaderBreadcrumbItem[] | null>(null);
  readonly icon = input<string | null>(null);
  readonly isRoot = input<boolean>(false);
  readonly showHistoryButtons = input<boolean>(true);

  goBack(): void {
    this.location.back();
  }

  goForward(): void {
    this.location.forward();
  }

  readonly computedBreadcrumbs = computed<PageHeaderBreadcrumbItem[]>(() => {
    const explicitBreadcrumbs = this.breadcrumbs();
    if (explicitBreadcrumbs !== null) {
      // Ensure explicit breadcrumbs always start with Home
      const hasHome =
        explicitBreadcrumbs.length > 0 &&
        (explicitBreadcrumbs[0].label === "Home" ||
          explicitBreadcrumbs[0].url === "/app");

      const items = hasHome
        ? [...explicitBreadcrumbs]
        : [
            { icon: "lucideHome", label: "Home", url: "/app" },
            ...explicitBreadcrumbs,
          ];

      return items.map((item) => ({
        ...item,
        icon: resolveBreadcrumbIcon(item),
      }));
    }

    // Delegate to NavigationContextService — icons and labels come from route data
    return (
      this.navigationContextService?.breadcrumbs() ?? [
        { icon: "lucideHome", label: "Home", url: "/app" },
      ]
    );
  });

  readonly activeBreadcrumbs = this.computedBreadcrumbs;

  readonly currentMobilePath = computed<string>(() => {
    if (this.navigationContextService) {
      const p = this.navigationContextService.mobilePath();
      if (p) {
        return p;
      }
    }
    return (
      this.computedBreadcrumbs()
        .map((c) => c.label)
        .filter(Boolean)
        .join(" / ") || `Home / ${this.title()}`
    );
  });
}
