import { Routes } from '@angular/router';
import { publicGuard } from '@core/guards/auth/public-guard';
import { LayoutMinimal } from '@layouts/layout-minimal/layout-minimal';

export const routes: Routes = [
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
];
