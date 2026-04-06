import { Component, inject, signal } from '@angular/core';
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  InputComponent,
  ButtonComponent,
  TypographyMuted,
  ToastService,
} from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import {
  form,
  maxLength,
  minLength,
  required,
  validateTree,
  FormField,
  submit,
} from '@angular/forms/signals';
import { PhoneMask } from '@features/auth/register-page/directives/phone-mask';
import { TenantService } from '@core/services/tenant-service';
import { RegisterTenant } from '@core/models/tenants.model';
import { lucideLoader } from '@ng-icons/lucide';
import { isResponseError } from '@shared/utils/response-validate.utils';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

type RegisterSchema = {
  companyName: string;
  username: string;
  email: string;
  contactInfo: string;
  password: string;
  confirmPassword: string;
};

@Component({
  selector: 'app-register-page',
  imports: [
    CardComponent,
    CardHeaderComponent,
    NgIcon,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    InputComponent,
    ButtonComponent,
    TypographyMuted,
    FormField,
    PhoneMask,
  ],
  templateUrl: './register-page.html',
  providers: [provideIcons({ lucideLoader })],
})
export class RegisterPage {
  protected readonly texts = APP_TEXTS.auth.register;
  protected isLoading = signal(false);

  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);
  private registerModel = signal<RegisterSchema>({
    companyName: '',
    username: '',
    email: '',
    contactInfo: '',
    password: '',
    confirmPassword: '',
  });

  protected registerForm = form(this.registerModel, (schemePath) => {
    const { companyName, confirmPassword, contactInfo, email, password, username } =
      this.texts.form;
    required(schemePath.companyName, { message: companyName.errors.required });
    minLength(schemePath.companyName, 3, { message: companyName.errors.minLength });
    maxLength(schemePath.companyName, 100, { message: companyName.errors.maxLength });

    required(schemePath.username, { message: username.errors.required });
    minLength(schemePath.username, 3, { message: username.errors.minLength });
    maxLength(schemePath.username, 100, { message: username.errors.maxLength });

    required(schemePath.email, { message: email.errors.required });

    required(schemePath.contactInfo, { message: contactInfo.errors.required });

    required(schemePath.password, { message: password.errors.required });
    minLength(schemePath.password, 8, { message: password.errors.minLength });
    required(schemePath.confirmPassword, { message: confirmPassword.errors.required });
    validateTree(schemePath, (model) => {
      if (model.valueOf(schemePath.password) === model.valueOf(schemePath.confirmPassword))
        return null;

      return {
        kind: 'passwordMismatch',
        message: confirmPassword.errors.mismatch,
        fieldTree: model.fieldTree.confirmPassword,
      };
    });
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    await submit(this.registerForm, async (schemaPath) => {
      this.isLoading.set(true);
      const registerTenant: RegisterTenant = {
        companyName: this.registerModel().companyName,
        user: {
          fullName: this.registerModel().username,
          email: this.registerModel().email,
          contactInfo: this.registerModel().contactInfo,
          password: this.registerModel().password,
        },
      };

      try {
        await firstValueFrom(this.tenantService.registerTenant(registerTenant));
        this.router.navigate(['/auth/login']);
        return [];
      } catch (err) {
        if (isResponseError(err)) {
          return [
            {
              fieldTree: schemaPath.email,
              kind: 'emailExists',
              message: err.error,
            },
          ];
        }
        return [];
      } finally {
        this.isLoading.set(false);
      }
    });
  }

  onError(key: keyof RegisterSchema) {
    const field = this.registerForm[key]();

    return field.touched() && field.invalid() ? field.errors() : [];
  }
}
