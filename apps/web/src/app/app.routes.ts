import type { Routes } from "@angular/router";
import { publicGuard } from "@core/guards/auth/public-guard";
import { LayoutMinimal } from "@layouts/layout-minimal/layout-minimal";
import { LayoutComponent } from "@layouts/layout/layout-component/layout-component";

import { mobileGuard } from "./core/guards/mobile/mobile-guard";
import { APP_ROUTE_PATHS } from "./shared/constants/app-routes.constant";

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "app/parking-lots",
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
        children: [
          {
            canMatch: [mobileGuard],
            data: {
              navContext: {
                scope: "parking",
                isRoot: true,
                title: "Parqueaderos",
                section: "Inicio",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-home-mobile/parking-home-mobile");
              return c.ParkingHomeMobile;
            },
            path: APP_ROUTE_PATHS.app.parkingLots,
            title: "Parqueaderos",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                isRoot: true,
                title: "Parqueaderos",
                section: "Inicio",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-home/parking-home");
              return c.ParkingHome;
            },
            path: APP_ROUTE_PATHS.app.parkingLots,
            title: "Parqueaderos",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Crear parqueadero",
                section: "Parqueaderos",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-form/parking-form");
              return c.ParkingFormComponent;
            },
            path: APP_ROUTE_PATHS.app.createParkingLots,
            title: "Crear parqueadero",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Configurar Parqueadero",
                section: "Parqueaderos",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-form/parking-form");
              return c.ParkingFormComponent;
            },
            path: APP_ROUTE_PATHS.app.editParkingLots,
            title: "Editar parqueadero",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Plazas",
                section: "Plazas",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/slots/page/parking-slots-list/parking-slots-list");
              return c.ParkingSlotsListPage;
            },
            path: APP_ROUTE_PATHS.app.parkingLotSlots,
            title: "Plazas",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Crear plazas",
                section: "Plazas",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/slots/page/parking-slot-form/parking-slot-form");
              return c.ParkingSlotFormPage;
            },
            path: APP_ROUTE_PATHS.app.createParkingLotSlot,
            title: "Crear plazas",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Editar plaza",
                section: "Plazas",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/slots/page/parking-slot-form/parking-slot-form");
              return c.ParkingSlotFormPage;
            },
            path: APP_ROUTE_PATHS.app.editParkingLotSlot,
            title: "Editar plaza",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Detalle de plaza",
                section: "Plazas",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/slots/page/parking-slots-list/parking-slots-list");
              return c.ParkingSlotsListPage;
            },
            path: APP_ROUTE_PATHS.app.parkingLotSlotDetail,
            title: "Detalle de plaza",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Tarifas",
                section: "Tarifas",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/rates/page/rates-page/rates-page");
              return c.RatesPageComponent;
            },
            path: APP_ROUTE_PATHS.app.parkingLotRates,
            title: "Tarifas",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Crear tarifa",
                section: "Tarifas",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/rates/components/rate-form/rate-form");
              return c.RateFormComponent;
            },
            path: APP_ROUTE_PATHS.app.createParkingLotRate,
            title: "Crear tarifa",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Editar tarifa",
                section: "Tarifas",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/rates/components/rate-form/rate-form");
              return c.RateFormComponent;
            },
            path: APP_ROUTE_PATHS.app.editParkingLotRate,
            title: "Editar tarifa",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Operaciones",
                section: "Operaciones",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c =
                await import("@features/operations/page/operations-page");
              return c.OperationsPageComponent;
            },
            path: APP_ROUTE_PATHS.app.parkingLotOperations,
            title: "Operaciones",
          },
          {
            data: {
              navContext: {
                scope: "parking",
                title: "Tickets",
                section: "Operaciones",
                backLink: "/app/parking-lots",
              },
            },
            loadComponent: async () => {
              const c = await import("@features/tickets/page/tickets-page");
              return c.TicketsPageComponent;
            },
            path: APP_ROUTE_PATHS.app.parkingLotTickets,
          },
          {
            data: {
              navContext: {
                scope: "tenant",
                isRoot: true,
                title: "Tickets Emitidos",
                section: "Operaciones",
              },
            },
            loadComponent: async () => {
              const c = await import("@features/tickets/page/tickets-page");
              return c.TicketsPageComponent;
            },
            path: APP_ROUTE_PATHS.app.tickets,
          },
        ],
        loadComponent: async () => {
          const m = await import("@features/dashboard/page/dashboard-page");
          return m.DashboardPage;
        },
        path: "",
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
