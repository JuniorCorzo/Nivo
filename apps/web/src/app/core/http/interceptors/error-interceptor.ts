import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResponseMapper } from '@core/mappers/response.mapper';
import { ToastService } from '@nivo-sass/design-system';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { catchError, throwError } from 'rxjs';

const messages = APP_TEXTS.server.errors;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const responseMapper = inject(ResponseMapper);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) return throwError(() => responseMapper.mapResponseError(response));

      const response = error.error;
      let errorMessage: string = messages.generic;

      switch (error.status) {
        case 404:
          errorMessage = messages[404];
          break;
        case 500:
          errorMessage = messages[500];
          break;
        default:
          errorMessage = messages.generic;
      }

      show(toastService, errorMessage);
      if (error.name === 'TimeoutError') errorMessage = messages.timeout;

      return throwError(() => responseMapper.mapResponseError(response));
    }),
  );
};

const show = async (toastService: ToastService, errorMessage: string) =>
  toastService.showToast({ type: 'error', message: errorMessage });
