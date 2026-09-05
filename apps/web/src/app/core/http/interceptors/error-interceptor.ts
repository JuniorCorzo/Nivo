import type { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { mapResponseError } from "@core/mappers/response.mapper";
import { ToastService } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { catchError, throwError } from "rxjs";

const messages = APP_TEXTS.server.errors;

const show = (toastService: ToastService, errorMessage: string) => {
  toastService.showToast({ message: errorMessage, type: "error" });
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((httpError) => {
      const response = httpError.error;
      if (httpError.status === 401) {
        return throwError(() => mapResponseError(response));
      }

      let errorMessage: string = messages.generic;

      switch (httpError.status) {
        case 404: {
          errorMessage = messages["404"];
          break;
        }
        case 500: {
          errorMessage = messages["500"];
          break;
        }
        default: {
          errorMessage = messages.generic;
        }
      }

      show(toastService, errorMessage);
      if (httpError.name === "TimeoutError") {
        errorMessage = messages.timeout;
      }

      return throwError(() => mapResponseError(response));
    })
  );
};
