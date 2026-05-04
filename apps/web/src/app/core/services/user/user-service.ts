import { inject, Injectable, signal } from '@angular/core';
import { UserControllerService } from '@core/api/generated/services';
import { UserMapper } from '@core/mappers/user.mapper';
import { UserModel } from '@core/models/user.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSignal = signal<UserModel | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  private userController = inject(UserControllerService);
  private userMapper = inject(UserMapper);

  constructor() {
    this.getCurrentUser();
  }

  private getCurrentUser() {
    this.userController
      .getCurrentUser()
      .pipe(map((response) => this.userMapper.mapToUserModel(response.data)))
      .subscribe((user) => this.currentUserSignal.set(user));
  }
}
