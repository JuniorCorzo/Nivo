import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";

import { NavigationContextService } from "./navigation-context.service";
import type {
  RouteBreadcrumb,
  RouteNavContext,
} from "./navigation-context.service";

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
              breadcrumb: {
                icon: "lucideParkingSquare",
                isRoot: true,
                label: "Parqueaderos",
                url: "/app/parking-lots",
              } satisfies RouteBreadcrumb,
              navContext: {
                isRoot: true,
                scope: "parking",
                section: "Inicio",
                title: "Parqueaderos",
              } satisfies RouteNavContext,
            },
            path: "app/parking-lots",
          },
          {
            children: [
              {
                children: [],
                data: {
                  breadcrumb: {
                    icon: "lucideCar",
                    label: "Operaciones",
                  } satisfies RouteBreadcrumb,
                  navContext: {
                    backLink: "/app/parking-lots",
                    scope: "parking",
                    section: "Operaciones",
                    title: "Operaciones",
                  } satisfies RouteNavContext,
                },
                path: "operations",
              },
              {
                children: [
                  {
                    children: [],
                    data: {
                      breadcrumb: {
                        icon: "lucideLayoutGrid",
                        label: "Plazas",
                      } satisfies RouteBreadcrumb,
                    },
                    path: "",
                  },
                ],
                data: {
                  breadcrumb: {
                    icon: "lucideLayoutGrid",
                    label: "Plazas",
                  } satisfies RouteBreadcrumb,
                },
                path: "slots",
              },
              {
                children: [],
                data: {
                  breadcrumb: {
                    icon: "lucideHome",
                    label: "Home",
                  } satisfies RouteBreadcrumb,
                },
                path: "home-dup",
              },
            ],
            data: {
              breadcrumb: {
                icon: "lucideBuilding2",
                isParking: true,
                label: "",
              } satisfies RouteBreadcrumb,
            },
            path: "app/parking-lots/:parkingId",
          },
          {
            children: [],
            data: {
              breadcrumb: {
                icon: "lucideTicket",
                label: "Tickets Emitidos",
              } satisfies RouteBreadcrumb,
              navContext: {
                isRoot: true,
                scope: "tenant",
                section: "Operaciones",
                title: "Tickets Emitidos",
              } satisfies RouteNavContext,
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

  it("should resolve parking root navigation context breadcrumbs from route data", async () => {
    await router.navigateByUrl("/app/parking-lots");

    expect(service.scope()).toBe("parking");
    expect(service.isRoot()).toBe(true);
    expect(service.navContext()?.title).toBe("Parqueaderos");
    expect(service.mobilePath()).toBe("Home / Parqueaderos");
    expect(service.breadcrumbs()).toEqual([
      { icon: "lucideHome", label: "Home", url: "/app" },
      {
        icon: "lucideParkingSquare",
        isParking: undefined,
        label: "Parqueaderos",
        url: "/app/parking-lots",
      },
    ]);
  });

  it("should resolve parking subpage with active parking name in breadcrumbs and mobile path", async () => {
    await router.navigateByUrl("/app/parking-lots/123/operations");

    expect(service.scope()).toBe("parking");
    expect(service.isRoot()).toBe(false);
    expect(service.navContext()?.title).toBe("Operaciones");
    expect(service.mobilePath()).toBe("Home / Central Norte / Operaciones");
    expect(service.backLink()).toBe("/app/parking-lots");
    expect(service.breadcrumbs()).toEqual([
      { icon: "lucideHome", label: "Home", url: "/app" },
      {
        icon: "lucideBuilding2",
        isParking: true,
        label: "Central Norte",
        url: "/app/parking-lots",
      },
      {
        icon: "lucideCar",
        isParking: undefined,
        label: "Operaciones",
        url: undefined,
      },
    ]);
  });

  it("should deduplicate breadcrumb labels and prevent duplicate Home or repeated labels", async () => {
    await router.navigateByUrl("/app/parking-lots/123/slots");
    expect(service.breadcrumbs()).toEqual([
      { icon: "lucideHome", label: "Home", url: "/app" },
      {
        icon: "lucideBuilding2",
        isParking: true,
        label: "Central Norte",
        url: "/app/parking-lots",
      },
      {
        icon: "lucideLayoutGrid",
        isParking: undefined,
        label: "Plazas",
        url: undefined,
      },
    ]);

    await router.navigateByUrl("/app/parking-lots/123/home-dup");
    expect(service.breadcrumbs()).toEqual([
      { icon: "lucideHome", label: "Home", url: "/app" },
      {
        icon: "lucideBuilding2",
        isParking: true,
        label: "Central Norte",
        url: "/app/parking-lots",
      },
    ]);
  });

  it("should update breadcrumbs dynamically when active parking name changes", async () => {
    await router.navigateByUrl("/app/parking-lots/123/operations");
    expect(service.mobilePath()).toBe("Home / Central Norte / Operaciones");

    activeParkingNameSignal.set("Sede Sur");
    TestBed.flushEffects();

    expect(service.mobilePath()).toBe("Home / Sede Sur / Operaciones");
    expect(service.breadcrumbs()[1].label).toBe("Sede Sur");
  });

  it("should resolve tenant root navigation breadcrumbs from route data", async () => {
    await router.navigateByUrl("/app/tickets");

    expect(service.scope()).toBe("tenant");
    expect(service.isRoot()).toBe(true);
    expect(service.navContext()?.title).toBe("Tickets Emitidos");
    expect(service.mobilePath()).toBe("Home / Tickets Emitidos");
    expect(service.breadcrumbs()).toEqual([
      { icon: "lucideHome", label: "Home", url: "/app" },
      {
        icon: "lucideTicket",
        isParking: undefined,
        label: "Tickets Emitidos",
        url: undefined,
      },
    ]);
  });

  it("should fallback gracefully when route has no breadcrumb data", async () => {
    await router.navigateByUrl("/app/no-context");

    expect(service.navContext()).toBeNull();
    expect(service.scope()).toBe("parking");
    expect(service.isRoot()).toBe(false);
    expect(service.breadcrumbs()).toEqual([
      { icon: "lucideHome", label: "Home", url: "/app" },
    ]);
    expect(service.mobilePath()).toBe("Home");
  });

  it("should reactively update breadcrumbs when navigating between different routes", async () => {
    await router.navigateByUrl("/app/parking-lots");
    expect(service.breadcrumbs()).toEqual([
      { icon: "lucideHome", label: "Home", url: "/app" },
      {
        icon: "lucideParkingSquare",
        isParking: undefined,
        label: "Parqueaderos",
        url: "/app/parking-lots",
      },
    ]);

    await router.navigateByUrl("/app/tickets");
    expect(service.breadcrumbs()).toEqual([
      { icon: "lucideHome", label: "Home", url: "/app" },
      {
        icon: "lucideTicket",
        isParking: undefined,
        label: "Tickets Emitidos",
        url: undefined,
      },
    ]);
  });
});
