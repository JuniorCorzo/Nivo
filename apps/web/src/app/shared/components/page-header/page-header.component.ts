import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowLeft } from "@ng-icons/lucide";
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
    }),
  ],
  selector: "app-page-header",
  standalone: true,
  styleUrl: "./page-header.component.css",
  templateUrl: "./page-header.component.html",
})
export class PageHeaderComponent {
  private readonly activeParkingService = inject(ActiveParkingService, {
    optional: true,
  });

  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly backLink = input<string | unknown[] | null>(null);
  readonly backAriaLabel = input<string>("Volver");
  readonly badge = input<string | null>(null);
  readonly badgeVariant = input<PageHeaderBadgeVariant>("info");
  readonly breadcrumbs = input<PageHeaderBreadcrumbItem[] | null>(null);

  readonly computedBreadcrumbs = computed<PageHeaderBreadcrumbItem[]>(() => {
    const explicitBreadcrumbs = this.breadcrumbs();
    if (explicitBreadcrumbs !== null) {
      return explicitBreadcrumbs;
    }

    const items: PageHeaderBreadcrumbItem[] = [];
    const parkingName = this.activeParkingService?.activeParkingName()?.trim();
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
}
