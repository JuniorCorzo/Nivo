import { computed, inject, Injectable, signal } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import type { ActivatedRouteSnapshot } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import type { PageHeaderBreadcrumbItem } from "@shared/components/page-header/page-header";
import { filter } from "rxjs/operators";

export type NavigationScope = "tenant" | "parking";

export interface RouteNavContext {
  scope: NavigationScope;
  title?: string;
  subtitle?: string;
  section?: string;
  backLink?: string;
  isRoot?: boolean;
}

export interface RouteBreadcrumb {
  label: string;
  icon: string;
  url?: string;
  isParking?: boolean;
  isRoot?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class NavigationContextService {
  private readonly router = inject(Router);
  private readonly activeParkingService = inject(ActiveParkingService, {
    optional: true,
  });

  private readonly _navContext = signal<RouteNavContext | null>(null);
  public readonly navContext = this._navContext.asReadonly();

  private readonly _routeBreadcrumbs = signal<RouteBreadcrumb[]>([]);

  public readonly scope = computed<NavigationScope>(
    () => this.navContext()?.scope ?? "parking"
  );

  public readonly isRoot = computed<boolean>(
    () => this.navContext()?.isRoot ?? false
  );

  public readonly backLink = computed<string | null>(
    () => this.navContext()?.backLink ?? null
  );

  public readonly breadcrumbs = computed<PageHeaderBreadcrumbItem[]>(() => {
    const rawCrumbs = this._routeBreadcrumbs();
    const activeParkingName =
      this.activeParkingService?.activeParkingName()?.trim() ?? "";

    const items: PageHeaderBreadcrumbItem[] = [
      { icon: "lucideHome", label: "Home", url: "/app" },
    ];

    const seenLabels = new Set<string>(["Home"]);

    for (const bc of rawCrumbs) {
      const label = bc.isParking ? activeParkingName || bc.label : bc.label;
      if (!label || seenLabels.has(label)) {
        continue;
      }
      seenLabels.add(label);

      const url = bc.isParking ? (bc.url ?? "/app/parking-lots") : bc.url;

      items.push({
        icon: bc.icon,
        isParking: bc.isParking,
        label,
        url,
      });
    }

    return items;
  });

  public readonly mobilePath = computed<string>(() =>
    this.breadcrumbs()
      .map((b) => b.label)
      .filter(Boolean)
      .join(" / ")
  );

  constructor() {
    this.extractAndSetNavContext();

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe(() => {
        this.extractAndSetNavContext();
      });
  }

  private extractAndSetNavContext(): void {
    let currentRoute: ActivatedRouteSnapshot | null =
      this.router.routerState.snapshot.root;

    let foundContext: RouteNavContext | null = null;
    const breadcrumbsStack: RouteBreadcrumb[] = [];

    while (currentRoute) {
      if (currentRoute.data && currentRoute.data["navContext"]) {
        /* SAFETY: route data['navContext'] adheres to RouteNavContext contract */
        foundContext = currentRoute.data["navContext"] as RouteNavContext;
      }
      if (currentRoute.data && currentRoute.data["breadcrumb"]) {
        /* SAFETY: route data['breadcrumb'] adheres to RouteBreadcrumb contract when declared */
        breadcrumbsStack.push(
          currentRoute.data["breadcrumb"] as RouteBreadcrumb
        );
      }
      currentRoute = currentRoute.firstChild;
    }

    this._navContext.set(foundContext);
    this._routeBreadcrumbs.set(breadcrumbsStack);
  }
}
