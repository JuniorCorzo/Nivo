import { computed, inject, Injectable, signal } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import type { ActivatedRouteSnapshot } from "@angular/router";
import { filter } from "rxjs/operators";
import { ActiveParkingService } from "@core/services/active-parking.service";
import type { PageHeaderBreadcrumbItem } from "@shared/components/page-header/page-header.component";

export type NavigationScope = "tenant" | "parking";

export interface RouteNavContext {
  scope: NavigationScope;
  title?: string;
  subtitle?: string;
  section?: string;
  backLink?: string;
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

  public readonly scope = computed<NavigationScope>(() => {
    return this.navContext()?.scope ?? "parking";
  });

  public readonly isRoot = computed<boolean>(() => {
    return this.navContext()?.isRoot ?? false;
  });

  public readonly backLink = computed<string | null>(() => {
    return this.navContext()?.backLink ?? null;
  });

  public readonly breadcrumbs = computed<PageHeaderBreadcrumbItem[]>(() => {
    const ctx = this.navContext();
    if (!ctx) {
      return [];
    }

    const items: PageHeaderBreadcrumbItem[] = [];

    if (ctx.scope === "parking") {
      if (ctx.isRoot) {
        items.push({
          icon: "lucideLayoutDashboard",
          label: ctx.section || "Inicio",
          url: "/app/parking-lots",
        });
        items.push({ label: ctx.title || "Parqueaderos" });
      } else {
        const parkingName =
          this.activeParkingService?.activeParkingName()?.trim() || "";
        if (parkingName) {
          items.push({
            label: parkingName,
            url: ctx.backLink || "/app/parking-lots",
          });
        }
        if (ctx.title) {
          items.push({ label: ctx.title });
        }
      }
    } else {
      // Scope tenant
      if (ctx.section) {
        items.push({ label: ctx.section });
      }
      const title =
        ctx.title && ctx.title.includes("Tickets") ? "Tickets" : ctx.title;
      if (title && title !== ctx.section) {
        items.push({ label: title });
      }
    }

    return items;
  });

  public readonly mobilePath = computed<string>(() => {
    const ctx = this.navContext();
    if (!ctx) {
      return "";
    }

    if (ctx.scope === "parking") {
      if (ctx.isRoot) {
        const section = ctx.section || "Inicio";
        const title = ctx.title || "Parqueaderos";
        return `${section} / ${title}`;
      }
      const parkingName =
        this.activeParkingService?.activeParkingName()?.trim() || "";
      const title = ctx.title || "";
      return parkingName ? `${parkingName} / ${title}` : title;
    }

    // Scope tenant
    const section = ctx.section || "Operaciones";
    const title =
      ctx.title && ctx.title.includes("Tickets") ? "Tickets" : ctx.title || "";
    return `${section} / ${title}`;
  });

  constructor() {
    this.extractAndSetNavContext();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.extractAndSetNavContext();
      });
  }

  private extractAndSetNavContext(): void {
    let currentRoute: ActivatedRouteSnapshot | null =
      this.router.routerState.snapshot.root;

    let foundContext: RouteNavContext | null = null;

    while (currentRoute) {
      if (currentRoute.data && currentRoute.data["navContext"]) {
        foundContext = currentRoute.data["navContext"] as RouteNavContext;
      }
      currentRoute = currentRoute.firstChild;
    }

    this._navContext.set(foundContext);
  }
}
