import { Injectable } from '@angular/core';
import { ResponseErrorModel } from '@core/models/response.model';
import { isResponseError } from '@shared/utils/response-validate.utils';

@Injectable({
  providedIn: 'root',
})
export class ResponseMapper {
  mapResponseError(response: Record<string, string>): ResponseErrorModel | null {
    if (isResponseError(response)) {
      return response;
    }
    return null;
  }
}
