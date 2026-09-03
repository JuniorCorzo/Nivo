import {
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http";
import type { ApplicationConfig } from "@angular/core";
import {
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { addWithCredentialsInterceptor } from "@core/http/interceptors/add-with-credentials.interceptor";
import { authInterceptor } from "@core/http/interceptors/auth-interceptor";
import { refreshTokenInterceptor } from "@core/http/interceptors/refresh-token-interceptor";
import { AuthService } from "@core/services/auth-service";
import { provideNgIconLoader, withCaching } from "@ng-icons/core";
import { provideHotToastConfig } from "@ngxpert/hot-toast";
import { catchError, of } from "rxjs";

import { routes } from "./app.routes";
import { provideApiConfiguration } from "./core/api/generated/api-configuration";
import { errorInterceptor } from "./core/http/interceptors/error-interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideApiConfiguration(isDevMode() ? "http://localhost:8080/api" : "/api"),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHotToastConfig({
      autoClose: true,
      duration: 3000,
      position: "top-right",
      style: {
        background: "var(--background)",
        border: "1px solid var(--border)",
        color: "var(--foreground)",
        padding: "0",
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
      ])
    ),
    provideNgIconLoader((name) => {
      const http = inject(HttpClient);
      return http.get(`assets/icons/${name}.svg`, { responseType: "text" });
    }, withCaching()),
    provideAppInitializer(() =>
      inject(AuthService)
        .refreshSession()
        .pipe(catchError(() => of(null)))
    ),
  ],
};
