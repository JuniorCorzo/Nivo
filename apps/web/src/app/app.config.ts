import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideNgIconLoader, withCaching } from '@ng-icons/core';
import { addWithCredentialsInterceptor } from '@core/http/interceptors/add-with-credentials.interceptor';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { errorInterceptor } from './core/http/interceptors/error-interceptor';
import { AuthService } from '@core/services/auth-service';
import { authInterceptor } from '@core/http/interceptors/auth-interceptor';
import { refreshTokenInterceptor } from '@core/http/interceptors/refresh-token-interceptor';
import { catchError, of } from 'rxjs';
import { provideApiConfiguration } from './core/api/generated/api-configuration';

export const appConfig: ApplicationConfig = {
  providers: [
    provideApiConfiguration(isDevMode() ? 'http://localhost:8080/api' : '/api'),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHotToastConfig({
      position: 'top-right',
      duration: 3000,
      autoClose: true,
      style: {
        background: 'var(--background)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
        padding: '0',
      },
      usePopover: false,
    }),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        addWithCredentialsInterceptor,
        errorInterceptor,
        authInterceptor,
        refreshTokenInterceptor,
      ]),
    ),
    provideNgIconLoader((name) => {
      const http = inject(HttpClient);
      return http.get(`assets/icons/${name}.svg`, { responseType: 'text' });
    }, withCaching()),
    provideAppInitializer(() =>
      inject(AuthService)
        .refreshSession()
        .pipe(catchError(() => of(null))),
    ),
  ],
};
