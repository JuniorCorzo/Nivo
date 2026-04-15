import { Routes } from '@angular/router';
import { publicGuard } from '@core/guards/auth/public-guard';
import { LayoutMinimal } from '@layouts/layout-minimal/layout-minimal';
import { LayoutComponent } from '@layouts/layout/layout-component/layout-component';

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
        path: 'login',
        loadComponent: () =>
          import('@features/auth/login/page/login-page/login-page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
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
        path: 'parking-lots',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('@features/dashboard/page/dashboard-page').then((m) => m.DashboardPage),
          },
          {
            path: '',
            outlet: 'sidebar',
            loadComponent: () =>
              import('@shared/components/sidebar/sidebar/sidebar').then((c) => c.Sidebar),
          },
        ],
      },
    ],
  },
];
