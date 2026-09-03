import type { OnDestroy, OnInit } from "@angular/core";
import { Component, inject, signal } from "@angular/core";
import {
  email,
  form,
  FormField,
  minLength,
  required,
} from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import type { UserCredentialsModel } from "@core/models/user.model";
import { AuthService } from "@core/services/auth-service";
import { RedirectService } from "@core/services/redirect/redirect-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideLoader } from "@ng-icons/lucide";
import {
  CardComponent,
  CardTitleComponent,
  CardContentComponent,
  InputComponent,
  CardHeaderComponent,
  CardDescriptionComponent,
  ButtonComponent,
  TypographyMuted,
  TypographyP,
} from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { exhaustMap, Subject, takeUntil } from "rxjs";

@Component({
  imports: [
    CardComponent,
    CardTitleComponent,
    CardContentComponent,
    InputComponent,
    CardHeaderComponent,
    CardDescriptionComponent,
    ButtonComponent,
    NgIcon,
    TypographyMuted,
    FormField,
    TypographyP,
    RouterLink,
  ],
  providers: [provideIcons({ lucideLoader })],
  selector: "app-login-page",
  templateUrl: "./login-page.html",
})
export class LoginPage implements OnInit, OnDestroy {
  protected readonly texts = APP_TEXTS.auth.login;
  protected invalidCredentials = signal(false);
  protected isLoading = signal(false);

  private authService = inject(AuthService);
  private redirectService = inject(RedirectService);
  private router = inject(Router);
  private submit = new Subject<void>();
  private destroy = new Subject<void>();
  private loginModel = signal<UserCredentialsModel>({
    email: "",
    password: "",
  });

  protected loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, {
      message: this.texts.form.email.errors.required,
    });
    email(schemaPath.email, { message: this.texts.form.email.errors.invalid });

    required(schemaPath.password, {
      message: this.texts.form.password.errors.required,
    });
    minLength(schemaPath.password, 8, {
      message: this.texts.form.password.errors.minLength,
    });
  });

  ngOnInit(): void {
    this.submit
      .pipe(
        exhaustMap(() => this.sendRequest(this.loginModel())),
        takeUntil(this.destroy)
      )
      .subscribe({
        complete: () => {
          this.isLoading.set(false);
        },
        next: (isLogged) => this.onHandleSuccess(isLogged),
      });
  }

  private onHandleSuccess(isLogged: boolean) {
    this.invalidCredentials.set(!isLogged);
    this.manageRedirect();
  }

  private manageRedirect() {
    const hasRedirect = this.redirectService.hasRedirectUrl();
    if (hasRedirect) {
      this.router.navigate([this.redirectService.getRedirectUrl()]);
      return;
    }

    this.router.navigate([APP_ROUTES.app.parkingLots]);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    this.submit.next();
  }

  onError(key: keyof UserCredentialsModel) {
    const field = this.loginForm[key]();

    return field.touched() && field.invalid() ? field.errors() : [];
  }

  private sendRequest(credentials: UserCredentialsModel) {
    return this.authService.login(credentials.email, credentials.password);
  }
}
