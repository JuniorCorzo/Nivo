import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { AuthenticationControllerService } from '@core/api/generated/services';
import { catchError, EMPTY, map, Observable, of } from 'rxjs';
import { AuthMapper } from '@core/mappers/auth.mapper';
import { ADD_WITH_CREDENTIALS } from '@core/http/context/add-with-credentials.token';
import { HttpContext } from '@angular/common/http';
import { Router } from '@angular/router';
import { AUTHORIZED } from '@core/http/context/auth.token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: WritableSignal<string | null> = signal(null);
  accessTokenSignal = this.accessToken.asReadonly();

  private authController = inject(AuthenticationControllerService);
  private authMapper = inject(AuthMapper);
  private router = inject(Router);

  private httpContext = () => {
    const httpContext = new HttpContext();
    httpContext.set(ADD_WITH_CREDENTIALS, true);
    httpContext.set(AUTHORIZED, false);
    return httpContext;
  };

  login(email: string, password: string): Observable<boolean> {
    return this.authController.login({ body: { email, password } }, this.httpContext()).pipe(
      map((response) => this.authMapper.mapToLoginResponseModel(response.data)),
      map(({ accessToken }) => {
        this.accessToken.set(accessToken);
        return !!accessToken;
      }),
      catchError(() => of(false)),
    );
  }

  refreshSession() {
    return this.authController.refreshSession({}, this.httpContext()).pipe(
      map(({ data }) => {
        const { accessToken } = data;
        this.accessToken.set(accessToken);
      }),
      catchError(() => {
        this.router.navigate(['/auth/login']);
        this.logout();
        return EMPTY;
      }),
    );
  }

  logout() {
    this.authController.logout({}, new HttpContext().set(ADD_WITH_CREDENTIALS, true)).subscribe({
      next: () => {
        this.accessToken.set(null);
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
