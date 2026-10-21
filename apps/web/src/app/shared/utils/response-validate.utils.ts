import type { ResponseErrorModel } from "@core/models/response.model";

export interface RawErrorPayload {
  code?: unknown;
  error?: unknown;
  message?: unknown;
  status?: unknown;
}

export const isResponseError = (
  response: RawErrorPayload | null | undefined
): response is ResponseErrorModel =>
  Boolean(
    response &&
    typeof response === "object" &&
    "error" in response &&
    "status" in response &&
    "code" in response
  );
