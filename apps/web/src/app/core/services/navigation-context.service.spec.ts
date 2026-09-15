import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { Router, provideRouter } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { NavigationContextService } from "./navigation-context.service";
import type { RouteNavContext } from "./navigation-context.service";

describe("NavigationContextService", () => {
  let service: NavigationContextService;
  let router: Router;
  let activeParkingNameSignal: ReturnType<typeof signal<string>>;

  beforeEach(() => {
    activeParkingNameSignal = signal<string>("Central Norte");

    TestBed.configureTestingModule({
      providers: [
        NavigationContextService,
        provideRouter([
          {
            children: [],
            data: {
              /* SAFETY: route data['navContext'] is mocked to conform to RouteNavContext */
              navContext: {
                isRoot: true,
                scope: "parking",
                section: "Inicio",
                title: "Parqueaderos",
              } as RouteNavContext,
            },
            path: "app/parking-lots",
          },
          {
            children: [],
            data: {
              /* SAFETY: route data['navContext'] is mocked to conform to RouteNavContext */
              navContext: {
                backLink: "/app/parking-lots",
                scope: "parking",
                section: "Operaciones",
                title: "Operaciones",
              } as RouteNavContext,
            },
            path: "app/parking-lots/:parkingId/operations",
          },
          {
            children: [],
            data: {
              /* SAFETY: route data['navContext'] is mocked to conform to RouteNavContext */
              navContext: {
                isRoot: true,
                scope: "tenant",
                section: "Operaciones",
                title: "Tickets Emitidos",
              } as RouteNavContext,
            },
            path: "app/tickets",
          },
          {
            children: [],
            path: "app/no-context",
          },
        ]),
        {
          provide: ActiveParkingService,
          useValue: {
            activeParkingName: activeParkingNameSignal,
          },
        },
      ],
    });

    service = TestBed.inject(NavigationContextService);
    router = TestBed.inject(Router);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should resolve parking root navigation context without parking prefix in breadcrumbs", async () => {
    await router.navigateByUrl("/app/parking-lots");

    expect(service.scope()).toBe("parking");
    expect(service.isRoot()).toBe(true);
    expect(service.navContext()?.title).toBe("Parqueaderos");
    expect(service.mobilePath()).toBe("Inicio / Parqueaderos");
    expect(service.breadcrumbs()).toEqual([
      { icon: "lucideLayoutDashboard", label: "Inicio", url: "/app/parking-lots" },
      { label: "Parqueaderos" },
    ]);
  });

  it("should resolve parking subpage with active parking name in breadcrumbs and mobile path", async () => {
    await router.navigateByUrl("/app/parking-lots/123/operations");

    expect(service.scope()).toBe("parking");
    expect(service.isRoot()).toBe(false);
    expect(service.navContext()?.title).toBe("Operaciones");
    expect(service.mobilePath()).toBe("Central Norte / Operaciones");
    expect(service.backLink()).toBe("/app/parking-lots");
    expect(service.breadcrumbs()).toEqual([
      { label: "Central Norte", url: "/app/parking-lots" },
      { label: "Operaciones" },
    ]);
  });

  it("should update breadcrumbs dynamically when active parking name changes", async () => {
    await router.navigateByUrl("/app/parking-lots/123/operations");
    expect(service.mobilePath()).toBe("Central Norte / Operaciones");

    activeParkingNameSignal.set("Sede Sur");
    TestBed.flushEffects();

    expect(service.mobilePath()).toBe("Sede Sur / Operaciones");
    expect(service.breadcrumbs()[0].label).toBe("Sede Sur");
  });

  it("should resolve tenant root navigation without requiring active parking", async () => {
    await router.navigateByUrl("/app/tickets");

    expect(service.scope()).toBe("tenant");
    expect(service.isRoot()).toBe(true);
    expect(service.navContext()?.title).toBe("Tickets Emitidos");
    expect(service.mobilePath()).toBe("Operaciones / Tickets");
    expect(service.breadcrumbs()).toEqual([
      { label: "Operaciones" },
      { label: "Tickets" },
    ]);
  });

  it("should fallback gracefully when route has no navContext", async () => {
    await router.navigateByUrl("/app/no-context");

    expect(service.navContext()).toBeNull();
    expect(service.scope()).toBe("parking");
    expect(service.isRoot()).toBe(false);
    expect(service.breadcrumbs()).toEqual([]);
    expect(service.mobilePath()).toBe("");
  });
});
