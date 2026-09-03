import type { CreatedUserDto, UserDto } from "../api/generated/models";
import type { RegisterUserModel, UserModel } from "../models/user.model";

export const mapToUserModel = (data: UserDto): UserModel => ({
  contactInfo: data.contactInfo ?? "",
  createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  email: data.email ?? "",
  fullName: data.fullName ?? "",
  id: data.id ?? "",
  role: data.role ?? "OPERATOR",
  tenant: {
    companyName: data.tenant?.companyName ?? "",
    id: data.tenant?.id ?? "",
  },
  updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
});

export const mapToCreatedRegisterDto = (
  model: RegisterUserModel
): CreatedUserDto => ({ ...model });
