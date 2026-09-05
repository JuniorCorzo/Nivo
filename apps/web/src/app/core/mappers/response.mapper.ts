import type { ResponseErrorModel } from "@core/models/response.model";
import { isResponseError } from "@shared/utils/response-validate.utils";

export const mapResponseError = (
  response: Record<string, string>
): ResponseErrorModel | null => {
  if (isResponseError(response)) {
    return response;
  }
  return null;
};
