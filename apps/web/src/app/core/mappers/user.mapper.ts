import { CreatedUserDto, UserDto } from '../api/generated/models';
import { RegisterUserModel, UserModel } from '../models/user.model';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserMapper {
  mapToUserModel(data: UserDto): UserModel {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  mapToCreatedRegisterDto(model: RegisterUserModel): CreatedUserDto {
    return { ...model };
  }
}
