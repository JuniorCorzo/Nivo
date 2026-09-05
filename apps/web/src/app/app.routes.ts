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
      },
      {
        loadComponent: async () => {
          const m =
            await import("@features/auth/register/page/register-page/register-page");
          return m.RegisterPage;
        },
        path: APP_ROUTE_PATHS.auth.register,
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
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-home/parking-home");
              return c.ParkingHome;
            },
            path: APP_ROUTE_PATHS.app.parkingLots,
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-form/parking-form");
              return c.ParkingFormComponent;
            },
            path: APP_ROUTE_PATHS.app.createParkingLots,
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/parking/page/parking-form/parking-form");
              return c.ParkingFormComponent;
            },
            path: APP_ROUTE_PATHS.app.editParkingLots,
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/slots/components/parking-slots-list/parking-slots-list");
              return c.ParkingSlotsListPage;
            },
            path: APP_ROUTE_PATHS.app.parkingLotSlots,
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/slots/components/parking-slot-form/parking-slot-form");
              return c.ParkingSlotFormPage;
            },
            path: APP_ROUTE_PATHS.app.createParkingLotSlot,
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/slots/components/parking-slot-form/parking-slot-form");
              return c.ParkingSlotFormPage;
            },
            path: APP_ROUTE_PATHS.app.editParkingLotSlot,
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/slots/components/parking-slots-list/parking-slots-list");
              return c.ParkingSlotsListPage;
            },
            path: APP_ROUTE_PATHS.app.parkingLotSlotDetail,
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/rates/components/rates-list/rates-list");
              return c.RateListComponent;
            },
            path: APP_ROUTE_PATHS.app.parkingLotRates,
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/rates/components/rate-form/rate-form");
              return c.RateFormComponent;
            },
            path: APP_ROUTE_PATHS.app.createParkingLotRate,
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/rates/components/rate-form/rate-form");
              return c.RateFormComponent;
            },
            path: APP_ROUTE_PATHS.app.editParkingLotRate,
          },
          {
            loadComponent: async () => {
              const c =
                await import("@features/operations/page/operations-page");
              return c.OperationsPageComponent;
            },
            path: APP_ROUTE_PATHS.app.parkingLotOperations,
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
