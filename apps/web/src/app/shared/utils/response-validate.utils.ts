import { ResponseErrorModel } from '@core/models/response.model';

export const isResponseError = (response: unknown): response is ResponseErrorModel => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    'status' in response &&
    'code' in response
  );
};
