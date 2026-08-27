import { CreatedUserDto, UserDto } from '../api/generated/models';
import { RegisterUserModel, UserModel } from '../models/user.model';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserMapper {
  mapToUserModel(data: UserDto): UserModel {
    return {
      id: data.id ?? '',
      fullName: data.fullName ?? '',
      email: data.email ?? '',
      contactInfo: data.contactInfo ?? '',
      role: data.role ?? 'OPERATOR',
      tenant: {
        id: data.tenant?.id ?? '',
        companyName: data.tenant?.companyName ?? '',
      },
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    };
  }

  mapToCreatedRegisterDto(model: RegisterUserModel): CreatedUserDto {
    return { ...model };
  }
}
