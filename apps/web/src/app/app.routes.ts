import { Routes } from '@angular/router';
import { publicGuard } from '@core/guards/auth/public-guard';
import { LayoutMinimal } from '@layouts/layout-minimal/layout-minimal';
import { LayoutComponent } from '@layouts/layout/layout-component/layout-component';
import { mobileGuard } from './core/guards/mobile/mobile-guard';
import { APP_ROUTE_PATHS } from './shared/constants/app-routes.constant';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app/parking-lots',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: LayoutMinimal,
    canActivate: [publicGuard],
    children: [
      {
        path: APP_ROUTE_PATHS.auth.login,
        loadComponent: () =>
          import('@features/auth/login/page/login-page/login-page').then((m) => m.LoginPage),
      },
      {
        path: APP_ROUTE_PATHS.auth.register,
        loadComponent: () =>
          import('@features/auth/register/page/register-page/register-page').then(
            (m) => m.RegisterPage,
          ),
      },
    ],
  },
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/dashboard/page/dashboard-page').then((m) => m.DashboardPage),
        children: [
          {
            path: APP_ROUTE_PATHS.app.parkingLots,
            canMatch: [mobileGuard],
            loadComponent: () =>
              import('@features/parking/components/parking-home-mobile/parking-home-mobile').then(
                (c) => c.ParkingHomeMobile,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.parkingLots,
            loadComponent: () =>
              import('@features/parking/components/parking-home/parking-home').then(
                (c) => c.ParkingHome,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.createParkingLots,
            loadComponent: () =>
              import('@features/parking/components/parking-form/parking-form').then(
                (c) => c.ParkingFormComponent,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.editParkingLots,
            loadComponent: () =>
              import('@features/parking/components/parking-form/parking-form').then(
                (c) => c.ParkingFormComponent,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.parkingLotSlots,
            loadComponent: () =>
              import('@features/slots/components/parking-slots-list/parking-slots-list').then(
                (c) => c.ParkingSlotsListPage,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.createParkingLotSlot,
            loadComponent: () =>
              import('@features/slots/components/parking-slot-form/parking-slot-form').then(
                (c) => c.ParkingSlotFormPage,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.editParkingLotSlot,
            loadComponent: () =>
              import('@features/slots/components/parking-slot-form/parking-slot-form').then(
                (c) => c.ParkingSlotFormPage,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.parkingLotSlotDetail,
            loadComponent: () =>
              import('@features/slots/components/parking-slots-list/parking-slots-list').then(
                (c) => c.ParkingSlotsListPage,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.parkingLotRates,
            loadComponent: () =>
              import('@features/rates/components/rates-list/rates-list').then(
                (c) => c.RateListComponent,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.createParkingLotRate,
            loadComponent: () =>
              import('@features/rates/components/rate-form/rate-form').then(
                (c) => c.RateFormComponent,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.editParkingLotRate,
            loadComponent: () =>
              import('@features/rates/components/rate-form/rate-form').then(
                (c) => c.RateFormComponent,
              ),
          },
          {
            path: APP_ROUTE_PATHS.app.parkingLotDetail,
            loadComponent: () =>
              import('@features/parking/components/parking-detail/parking-detail').then(
                (c) => c.ParkingDetail,
              ),
          },
        ],
      },
      {
        path: '',
        outlet: 'sidebar',
        loadComponent: () =>
          import('@shared/components/sidebar/sidebar/sidebar').then((c) => c.Sidebar),
      },
    ],
  },
];
