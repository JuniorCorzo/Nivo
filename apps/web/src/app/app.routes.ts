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
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-home-mobile/parking-home-mobile");
              return c.ParkingHomeMobile;
            },
            path: APP_ROUTE_PATHS.app.parkingLots,
            title: "Parqueaderos",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-home/parking-home");
              return c.ParkingHome;
            },
            path: APP_ROUTE_PATHS.app.parkingLots,
            title: "Parqueaderos",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-form/parking-form");
              return c.ParkingFormComponent;
            },
            path: APP_ROUTE_PATHS.app.createParkingLots,
            title: "Crear parqueadero",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-form/parking-form");
              return c.ParkingFormComponent;
            },
            path: APP_ROUTE_PATHS.app.editParkingLots,
            title: "Editar parqueadero",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/slots/page/parking-slots-list/parking-slots-list");
              return c.ParkingSlotsListPage;
            },
            path: APP_ROUTE_PATHS.app.parkingLotSlots,
            title: "Plazas",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/slots/page/parking-slot-form/parking-slot-form");
              return c.ParkingSlotFormPage;
            },
            path: APP_ROUTE_PATHS.app.createParkingLotSlot,
            title: "Crear plazas",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/slots/page/parking-slot-form/parking-slot-form");
              return c.ParkingSlotFormPage;
            },
            path: APP_ROUTE_PATHS.app.editParkingLotSlot,
            title: "Editar plaza",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/slots/page/parking-slots-list/parking-slots-list");
              return c.ParkingSlotsListPage;
            },
            path: APP_ROUTE_PATHS.app.parkingLotSlotDetail,
            title: "Detalle de plaza",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/rates/components/rates-list/rates-list");
              return c.RateListComponent;
            },
            path: APP_ROUTE_PATHS.app.parkingLotRates,
            title: "Tarifas",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/rates/components/rate-form/rate-form");
              return c.RateFormComponent;
            },
            path: APP_ROUTE_PATHS.app.createParkingLotRate,
            title: "Crear tarifa",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/rates/components/rate-form/rate-form");
              return c.RateFormComponent;
            },
            path: APP_ROUTE_PATHS.app.editParkingLotRate,
            title: "Editar tarifa",
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/operations/page/operations-page");
              return c.OperationsPageComponent;
            },
            path: APP_ROUTE_PATHS.app.parkingLotOperations,
            title: "Operaciones",
          },
          {
            loadComponent: async () => {
              const c = await import("@features/tickets/page/tickets-page");
              return c.TicketsPageComponent;
            },
            path: APP_ROUTE_PATHS.app.parkingLotTickets,
          },
          {
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
