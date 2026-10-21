import type { AuthenticationResponseDto } from "../api/generated/models";
import type { LoginResponseModel } from "../models/auth.model";

export const mapToLoginResponseModel = (
  dto: AuthenticationResponseDto
): LoginResponseModel => ({
  accessToken: dto.accessToken,
  refreshToken: dto.refreshToken,
});
