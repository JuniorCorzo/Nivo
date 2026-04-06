import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideNgIconLoader, withCaching } from '@ng-icons/core';
import { addWithCredentialsInterceptor } from '@core/http/interceptors/add-with-credentials.interceptor';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { errorInterceptor } from './core/http/interceptors/error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
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
      withInterceptors([addWithCredentialsInterceptor, errorInterceptor]),
    ),
    provideNgIconLoader((name) => {
      const http = inject(HttpClient);
      return http.get(`assets/icons/${name}.svg`, { responseType: 'text' });
    }, withCaching()),
  ],
};
