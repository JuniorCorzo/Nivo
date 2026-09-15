import { Location } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { NavigationContextService } from "@core/services/navigation-context.service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowLeft,
  lucideCar,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCoins,
  lucideLayoutDashboard,
  lucideParkingSquare,
  lucideTicket,
} from "@ng-icons/lucide";
import {
  BadgeComponent,
  TypographyH1,
  TypographyMuted,
} from "@nivo-sass/design-system";

export type PageHeaderBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | "outline";

export interface PageHeaderBreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block w-full",
  },
  imports: [RouterLink, NgIcon, BadgeComponent, TypographyH1, TypographyMuted],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCar,
      lucideChevronLeft,
      lucideChevronRight,
      lucideCoins,
      lucideLayoutDashboard,
      lucideParkingSquare,
      lucideTicket,
    }),
  ],
  selector: "app-page-header",
  standalone: true,
  styleUrl: "./page-header.component.css",
  templateUrl: "./page-header.component.html",
})
export class PageHeaderComponent {
  private readonly location = inject(Location);
  private readonly activeParkingService = inject(ActiveParkingService, {
    optional: true,
  });
  private readonly navigationContextService = inject(NavigationContextService, {
    optional: true,
  });

  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly backLink = input<string | unknown[] | null>(null);
  readonly backAriaLabel = input<string>("Volver");
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
      return explicitBreadcrumbs;
    }

    if (this.isRoot()) {
      return [];
    }

    if (this.navigationContextService) {
      const navBreadcrumbs = this.navigationContextService.breadcrumbs();
      if (navBreadcrumbs.length > 0) {
        return navBreadcrumbs;
      }
    }

    if (!this.backLink()) {
      return [];
    }

    const items: PageHeaderBreadcrumbItem[] = [];
    const parkingName = this.activeParkingService
      ? this.activeParkingService.activeParkingName()?.trim()
      : undefined;
    if (parkingName) {
      items.push({ label: parkingName });
    }

    const currentTitle = this.title()?.trim();
    if (currentTitle) {
      items.push({ label: currentTitle });
    }

    return items;
  });

  readonly activeBreadcrumbs = this.computedBreadcrumbs;

  readonly currentMobilePath = computed<string>(() => {
    if (this.navigationContextService) {
      const navMobilePath = this.navigationContextService.mobilePath();
      if (navMobilePath) {
        return navMobilePath;
      }
    }

    const crumbs = this.computedBreadcrumbs();
    if (crumbs.length > 0) {
      return crumbs.map((c) => c.label).join(" / ");
    }

    const parkingName = this.activeParkingService
      ? this.activeParkingService.activeParkingName()?.trim()
      : undefined;
    if (parkingName && !this.isRoot()) {
      return `${parkingName} / ${this.title()}`;
    }

    return this.title();
  });
}

