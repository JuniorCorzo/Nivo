import { HttpContext } from "@angular/common/http";
import type { WritableSignal } from "@angular/core";
import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "@core/api/generated/services";
import { ADD_WITH_CREDENTIALS } from "@core/http/context/add-with-credentials.token";
import { AUTHORIZED } from "@core/http/context/auth.token";
import { mapToLoginResponseModel } from "@core/mappers/auth.mapper";
import { UserService } from "@core/services/user/user-service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import type { Observable } from "rxjs";
import { catchError, EMPTY, finalize, map, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private accessToken: WritableSignal<string | null> = signal(null);
  public accessTokenSignal = this.accessToken.asReadonly();
  public isAuthenticate = computed(() => !!this.accessTokenSignal());

  private sessionGeneration = signal<number>(0);
  public sessionGenerationSignal = this.sessionGeneration.asReadonly();

  private authController = inject(AuthenticationService);
  private router = inject(Router);
  private userService = inject(UserService);

  private static httpContext() {
    const httpContext = new HttpContext();
    httpContext.set(ADD_WITH_CREDENTIALS, true);
    httpContext.set(AUTHORIZED, false);
    return httpContext;
  }

  login(email: string, password: string): Observable<boolean> {
    return this.authController
      .login({ body: { email, password } }, AuthService.httpContext())
      .pipe(
        map((response) => mapToLoginResponseModel(response.data)),
        map(({ accessToken }) => {
          this.userService.clearCurrentUser();
          this.sessionGeneration.update((n) => n + 1);
          this.accessToken.set(accessToken);
          if (accessToken) {
            this.userService.loadCurrentUser().subscribe();
          }
          return !!accessToken;
        }),
        catchError(() => of(false))
      );
  }

  refreshSession(): Observable<string> {
    return this.authController
      .refreshSession({}, AuthService.httpContext())
      .pipe(
        map(({ data }) => {
          const { accessToken } = data;
          this.accessToken.set(accessToken);
          if (accessToken) {
            this.userService.loadCurrentUser().subscribe();
          }
          return accessToken;
        })
      );
  }

  logout() {
    this.accessToken.set(null);
    this.userService.clearCurrentUser();
    this.sessionGeneration.update((n) => n + 1);
    this.authController
      .logout({}, AuthService.httpContext())
      .pipe(
        catchError(() => EMPTY),
        finalize(() => {
          this.router.navigate([APP_ROUTES.auth.login]);
        })
      )
      .subscribe();
  }
}
