import type { Routes } from "@angular/router";
import { publicGuard } from "@core/guards/auth/public-guard";
import { LayoutMinimal } from "@layouts/layout-minimal/layout-minimal";
import { LayoutComponent } from "@layouts/layout/layout";

import type {
  RouteBreadcrumb,
  RouteNavContext,
} from "./core/services/navigation-context.service";
import { APP_ROUTE_PATHS } from "./shared/constants/app-routes.constant";

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "app/dashboard",
  },
  {
    canActivate: [publicGuard],
    children: [
      {
        loadComponent: async () => {
          const m =
            await import("@features/auth/login/page/login-page/login-page");
          return m.LoginPage;
        },
        path: APP_ROUTE_PATHS.auth.login,
        title: "Iniciar sesión",
      },
      {
        loadComponent: async () => {
          const m =
            await import("@features/auth/register/page/register-page/register-page");
          return m.RegisterPage;
        },
        path: APP_ROUTE_PATHS.auth.register,
        title: "Crear cuenta",
      },
    ],
    component: LayoutMinimal,
    path: "auth",
  },
  {
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: APP_ROUTE_PATHS.app.dashboard,
      },
      {
        data: {
          breadcrumb: {
            icon: "lucideLayoutDashboard",
            label: "Dashboard",
          } satisfies RouteBreadcrumb,
          navContext: {
            isRoot: true,
            scope: "tenant",
            section: "Dashboard",
            title: "Dashboard",
          } satisfies RouteNavContext,
        },
        loadComponent: async () => {
          const m = await import("@features/dashboard/page/dashboard-page");
          return m.DashboardPage;
        },
        path: APP_ROUTE_PATHS.app.dashboard,
        title: "Dashboard",
      },
          {
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
            loadComponent: async () => {
              const c = await import("@features/tickets/page/tickets-page");
              return c.TicketsPageComponent;
            },
            path: APP_ROUTE_PATHS.app.tickets,
          },
          {
            children: [
              {
                loadComponent: async () => {
                  const c =
                    await import("@features/parking/page/parking-home/parking-home");
                  return c.ParkingHome;
                },
                path: "",
                title: "Parqueaderos",
              },
              {
                data: {
                  breadcrumb: {
                    icon: "lucidePlus",
                    label: "Crear parqueadero",
                  } satisfies RouteBreadcrumb,
                  navContext: {
                    backLink: "/app/parking-lots",
                    scope: "parking",
                    section: "Parqueaderos",
                    title: "Crear parqueadero",
                  } satisfies RouteNavContext,
                },
                loadComponent: async () => {
                  const c =
                    await import("@features/parking/page/parking-form/parking-form");
                  return c.ParkingFormComponent;
                },
                path: "create",
                title: "Crear parqueadero",
              },
              {
                children: [
                  {
                    data: {
                      breadcrumb: {
                        icon: "lucideSettings",
                        label: "Configurar parqueadero",
                      } satisfies RouteBreadcrumb,
                      navContext: {
                        backLink: "/app/parking-lots",
                        scope: "parking",
                        section: "Parqueaderos",
                        title: "Configurar Parqueadero",
                      } satisfies RouteNavContext,
                    },
                    loadComponent: async () => {
                      const c =
                        await import("@features/parking/page/parking-form/parking-form");
                      return c.ParkingFormComponent;
                    },
                    path: "edit",
                    title: "Editar parqueadero",
                  },
                  {
                    children: [
                      {
                        data: {
                          breadcrumb: {
                            icon: "lucideLayoutGrid",
                            label: "Plazas",
                          } satisfies RouteBreadcrumb,
                          navContext: {
                            backLink: "/app/parking-lots",
                            scope: "parking",
                            section: "Plazas",
                            title: "Plazas",
                          } satisfies RouteNavContext,
                        },
                        loadComponent: async () => {
                          const c =
                            await import("@features/slots/page/parking-slots-list/parking-slots-list");
                          return c.ParkingSlotsListPage;
                        },
                        path: "",
                        title: "Plazas",
                      },
                      {
                        data: {
                          breadcrumb: {
                            icon: "lucidePlus",
                            label: "Crear plazas",
                          } satisfies RouteBreadcrumb,
                          navContext: {
                            backLink: "/app/parking-lots",
                            scope: "parking",
                            section: "Plazas",
                            title: "Crear plazas",
                          } satisfies RouteNavContext,
                        },
                        loadComponent: async () => {
                          const c =
                            await import("@features/slots/page/parking-slot-form/parking-slot-form");
                          return c.ParkingSlotFormPage;
                        },
                        path: "new",
                        title: "Crear plazas",
                      },
                      {
                        data: {
                          breadcrumb: {
                            icon: "lucideEdit",
                            label: "Editar plaza",
                          } satisfies RouteBreadcrumb,
                          navContext: {
                            backLink: "/app/parking-lots",
                            scope: "parking",
                            section: "Plazas",
                            title: "Editar plaza",
                          } satisfies RouteNavContext,
                        },
                        loadComponent: async () => {
                          const c =
                            await import("@features/slots/page/parking-slot-form/parking-slot-form");
                          return c.ParkingSlotFormPage;
                        },
                        path: ":slotId/edit",
                        title: "Editar plaza",
                      },
                      {
                        data: {
                          breadcrumb: {
                            icon: "lucideSquare",
                            label: "Detalle de plaza",
                          } satisfies RouteBreadcrumb,
                          navContext: {
                            backLink: "/app/parking-lots",
                            scope: "parking",
                            section: "Plazas",
                            title: "Detalle de plaza",
                          } satisfies RouteNavContext,
                        },
                        loadComponent: async () => {
                          const c =
                            await import("@features/slots/page/parking-slots-list/parking-slots-list");
                          return c.ParkingSlotsListPage;
                        },
                        path: ":slotId",
                        title: "Detalle de plaza",
                      },
                    ],
                    data: {
                      breadcrumb: {
                        icon: "lucideLayoutGrid",
                        label: "Plazas",
                        url: "",
                      } satisfies RouteBreadcrumb,
                    },
                    path: "slots",
                  },
                  {
                    children: [
                      {
                        data: {
                          breadcrumb: {
                            icon: "lucideCoins",
                            label: "Tarifas",
                          } satisfies RouteBreadcrumb,
                          navContext: {
                            backLink: "/app/parking-lots",
                            scope: "parking",
                            section: "Tarifas",
                            title: "Tarifas",
                          } satisfies RouteNavContext,
                        },
                        loadComponent: async () => {
                          const c =
                            await import("@features/rates/page/rates-page/rates-page");
                          return c.RatesPageComponent;
                        },
                        path: "",
                        title: "Tarifas",
                      },
                      {
                        data: {
                          breadcrumb: {
                            icon: "lucidePlus",
                            label: "Crear tarifa",
                          } satisfies RouteBreadcrumb,
                          navContext: {
                            backLink: "/app/parking-lots",
                            scope: "parking",
                            section: "Tarifas",
                            title: "Crear tarifa",
                          } satisfies RouteNavContext,
                        },
                        loadComponent: async () => {
                          const c =
                            await import("@features/rates/components/form/rate-form/rate-form");
                          return c.RateFormComponent;
                        },
                        path: "new",
                        title: "Crear tarifa",
                      },
                      {
                        data: {
                          breadcrumb: {
                            icon: "lucideEdit",
                            label: "Editar tarifa",
                          } satisfies RouteBreadcrumb,
                          navContext: {
                            backLink: "/app/parking-lots",
                            scope: "parking",
                            section: "Tarifas",
                            title: "Editar tarifa",
                          } satisfies RouteNavContext,
                        },
                        loadComponent: async () => {
                          const c =
                            await import("@features/rates/components/form/rate-form/rate-form");
                          return c.RateFormComponent;
                        },
                        path: ":rateId/edit",
                        title: "Editar tarifa",
                      },
                    ],
                    data: {
                      breadcrumb: {
                        icon: "lucideCoins",
                        label: "Tarifas",
                      } satisfies RouteBreadcrumb,
                    },
                    path: "rates",
                  },
                  {
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
                    loadComponent: async () => {
                      const c =
                        await import("@features/operations/page/operations-page");
                      return c.OperationsPageComponent;
                    },
                    path: "operations",
                    title: "Operaciones",
                  },
                  {
                    data: {
                      breadcrumb: {
                        icon: "lucideTicket",
                        label: "Tickets",
                      } satisfies RouteBreadcrumb,
                      navContext: {
                        backLink: "/app/parking-lots",
                        scope: "parking",
                        section: "Operaciones",
                        title: "Tickets",
                      } satisfies RouteNavContext,
                    },
                    loadComponent: async () => {
                      const c =
                        await import("@features/tickets/page/tickets-page");
                      return c.TicketsPageComponent;
                    },
                    path: "tickets",
                  },
                ],
                data: {
                  breadcrumb: {
                    icon: "lucideBuilding2",
                    isParking: true,
                    label: "",
                    url: "/app/parking-lots",
                  } satisfies RouteBreadcrumb,
                },
                path: ":parkingId",
              },
            ],
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
            path: APP_ROUTE_PATHS.app.parkingLots,
          },
      {
        loadComponent: async () => {
          const c = await import("@shared/components/sidebar/sidebar/sidebar");
          return c.Sidebar;
        },
        outlet: "sidebar",
        path: "",
      },
    ],
    component: LayoutComponent,
    path: "app",
  },
];
