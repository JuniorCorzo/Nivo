import type { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { mapResponseError } from "@core/mappers/response.mapper";
import { MetricsService } from "@core/services/metrics.service";
import { ToastService } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { catchError, throwError } from "rxjs";

const messages = APP_TEXTS.server.errors;

const show = (toastService: ToastService, errorMessage: string) => {
  toastService.showToast({ message: errorMessage, type: "error" });
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const metricsService = inject(MetricsService, { optional: true });

  return next(req).pipe(
    catchError((httpError) => {
      const response = httpError.error;
      metricsService?.recordApiError({
        errorType: httpError.name === "TimeoutError" ? "timeout" : "",
        statusCode: httpError.status,
      });

      if (httpError.status === 401) {
        return throwError(() => mapResponseError(response));
      }

      let errorMessage: string = response?.message || messages.generic;

      switch (httpError.status) {
        case 404: {
          errorMessage = response?.message || messages["404"];
          break;
        }
        case 409: {
          errorMessage =
            response?.message ||
            "No se puede realizar la operación porque los recursos están ocupados o en conflicto.";
          break;
        }
        case 500: {
          errorMessage = response?.message || messages["500"];
          break;
        }
        default: {
          errorMessage = response?.message || messages.generic;
        }
      }

      if (httpError.name === "TimeoutError") {
        errorMessage = messages.timeout;
      }

      show(toastService, errorMessage);

      return throwError(() => mapResponseError(response));
    })
  );
};
