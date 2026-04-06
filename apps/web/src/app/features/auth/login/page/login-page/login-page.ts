import { Component, inject, signal } from '@angular/core';
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
export class LoginPage {
  protected readonly texts = APP_TEXTS.auth.login;
  protected invalidCredentials = signal(false);
  protected isLoading = signal(false);

  private authService = inject(AuthService);
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

  onSubmit(event: Event) {
    event.preventDefault();
    const { email, password } = this.loginModel();
    this.isLoading.set(true);
    this.authService.login(email, password).subscribe({
      next: (isLogged) => {
        this.invalidCredentials.set(!isLogged);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onError(key: keyof UserCredentialsModel) {
    const field = this.loginForm[key]();

    return field.touched() && field.invalid() ? field.errors() : [];
  }
}
