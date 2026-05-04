import { Injectable } from '@angular/core';
import { LoginResponseModel } from '../models/auth.model';
import { AuthenticationResponseDto } from '../api/generated/models';

@Injectable({
  providedIn: 'root',
})
export class AuthMapper {
  mapToLoginResponseModel(dto: AuthenticationResponseDto): LoginResponseModel {
    return {
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
    };
  }
}
