import { inject, Injectable, signal } from "@angular/core";
import { UsersService } from "@core/api/generated/services";
import { mapToUserModel } from "@core/mappers/user.mapper";
import type { UserModel } from "@core/models/user.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private currentUserSignal = signal<UserModel | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  private usersService = inject(UsersService);

  constructor() {
    this.getCurrentUser();
  }

  private getCurrentUser() {
    this.usersService
      .getCurrentUser()
      .pipe(
        map((response) =>
          response.data ? mapToUserModel(response.data) : null
        )
      )
      .subscribe((user) => this.currentUserSignal.set(user));
  }
}
