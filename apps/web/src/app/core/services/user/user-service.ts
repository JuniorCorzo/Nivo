import { inject, Injectable, signal } from "@angular/core";
import { UsersService } from "@core/api/generated/services";
import { mapToUserModel } from "@core/mappers/user.mapper";
import type { UserModel } from "@core/models/user.model";
import type { Role } from "@core/type/role.type";
import { catchError, map, of, shareReplay, tap } from "rxjs";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private currentUserSignal = signal<UserModel | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  private currentUserRequest$: Observable<UserModel | null> | null = null;

  private usersSignal = signal<UserModel[]>([]);
  public users = this.usersSignal.asReadonly();

  private usersService = inject(UsersService);

  constructor() {
    this.loadCurrentUser().subscribe();
  }

  public loadCurrentUser(): Observable<UserModel | null> {
    if (this.currentUserSignal() !== null) {
      return of(this.currentUserSignal());
    }

    if (!this.currentUserRequest$) {
      this.currentUserRequest$ = this.usersService.getCurrentUser().pipe(
        map((response) => (response.data ? mapToUserModel(response.data) : null)),
        tap((user) => this.currentUserSignal.set(user)),
        catchError(() => {
          this.currentUserSignal.set(null);
          return of(null);
        }),
        shareReplay(1),
      );
    }

    return this.currentUserRequest$;
  }

  public listUsers(): Observable<UserModel[]> {
    return this.usersService.getUsers().pipe(
      map((response) => (response.data ?? []).map(mapToUserModel)),
      tap((users) => this.usersSignal.set(users)),
    );
  }

  public inviteUser(email: string, role: Role, _fullName?: string): Observable<unknown> {
    const tenantId = this.currentUser()?.tenant?.id ?? "";
    const inviteBy = this.currentUser()?.id ?? "";
    return this.usersService.inviteUserWithRol({
      body: {
        email,
        inviteBy,
        role,
        tenantId,
      },
    });
  }

  public modifyRole(userId: string, role: Role): Observable<UserModel> {
    const tenantId = this.currentUser()?.tenant?.id ?? "";
    return this.usersService
      .modifyRol({
        body: {
          newRole: role,
          tenantId,
          userId,
        },
      })
      .pipe(
        map((response) => mapToUserModel(response.data)),
        tap((updatedUser) => {
          this.usersSignal.update((users) => users.map((u) => (u.id === userId ? updatedUser : u)));
        }),
      );
  }

  public deactivateUser(userId: string): Observable<void> {
    const tenantId = this.currentUser()?.tenant?.id ?? "";
    const deactivatedBy = this.currentUser()?.id ?? "";
    return this.usersService
      .deactivateUser({
        body: {
          deactivatedBy,
          tenantId,
          userId,
        },
      })
      .pipe(
        tap(() => {
          this.usersSignal.update((users) => users.filter((u) => u.id !== userId));
        }),
        map(() => {
          // void
        }),
      );
  }
}
