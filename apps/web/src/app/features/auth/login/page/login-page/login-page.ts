import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
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
} from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { UserCredentialsModel } from '@core/models/user.model';
import { AuthService } from '@core/services/auth-service';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { RouterLink } from '@angular/router';
import { lucideLoader } from '@ng-icons/lucide';
import { exhaustMap, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login-page',
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
  templateUrl: './login-page.html',
  providers: [provideIcons({ lucideLoader })],
})
export class LoginPage implements OnInit, OnDestroy {
  protected readonly texts = APP_TEXTS.auth.login;
  protected invalidCredentials = signal(false);
  protected isLoading = signal(false);

  private authService = inject(AuthService);
  private submit = new Subject<void>();
  private destroy = new Subject<void>();
  private loginModel = signal<UserCredentialsModel>({
    email: '',
    password: '',
  });

  protected loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: this.texts.form.email.errors.required });
    email(schemaPath.email, { message: this.texts.form.email.errors.invalid });

    required(schemaPath.password, { message: this.texts.form.password.errors.required });
    minLength(schemaPath.password, 8, { message: this.texts.form.password.errors.minLength });
  });

  ngOnInit(): void {
    this.submit
      .pipe(
        exhaustMap(() => this.sendRequest(this.loginModel())),
        takeUntil(this.destroy),
      )
      .subscribe({
        next: (isLogged) => {
          this.invalidCredentials.set(!isLogged);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
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

  private sendRequest({ email, password }: UserCredentialsModel) {
    return this.authService.login(email, password);
  }
}
