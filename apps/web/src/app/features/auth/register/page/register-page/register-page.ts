import type { OnDestroy, OnInit } from "@angular/core";
import { Component, inject, signal } from "@angular/core";
import type { FieldTree } from "@angular/forms/signals";
import {
  form,
  maxLength,
  minLength,
  required,
  validateTree,
  FormField,
  submit,
} from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import type { RegisterTenant } from "@core/models/tenants.model";
import { TenantService } from "@core/services/tenant-service";
import { PhoneMask } from "@features/auth/register-page/directives/phone-mask";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideLoader } from "@ng-icons/lucide";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  InputComponent,
  ButtonComponent,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { isResponseError } from "@shared/utils/response-validate.utils";
import type { RawErrorPayload } from "@shared/utils/response-validate.utils";
import { exhaustMap, firstValueFrom, from, Subject, takeUntil } from "rxjs";

interface RegisterSchema {
  companyName: string;
  username: string;
  email: string;
  contactInfo: string;
  password: string;
  confirmPassword: string;
}

interface RegisterPayload {
  registerTenant: RegisterTenant;
  schemaPath: FieldTree<RegisterSchema, string | number>;
}

@Component({
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
    RouterLink,
  ],
  providers: [provideIcons({ lucideLoader })],
  selector: "app-register-page",
  templateUrl: "./register-page.html",
})
export class RegisterPage implements OnInit, OnDestroy {
  protected readonly texts = APP_TEXTS.auth.register;
  protected isLoading = signal(false);

  private readonly submitter = new Subject<RegisterPayload>();
  private readonly destroyer = new Subject<void>();
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);
  private registerModel = signal<RegisterSchema>({
    companyName: "",
    confirmPassword: "",
    contactInfo: "",
    email: "",
    password: "",
    username: "",
  });

  protected registerForm = form(this.registerModel, (schemePath) => {
    const {
      companyName,
      confirmPassword,
      contactInfo,
      email,
      password,
      username,
    } = this.texts.form;
    required(schemePath.companyName, { message: companyName.errors.required });
    minLength(schemePath.companyName, 3, {
      message: companyName.errors.minLength,
    });
    maxLength(schemePath.companyName, 100, {
      message: companyName.errors.maxLength,
    });

    required(schemePath.username, { message: username.errors.required });
    minLength(schemePath.username, 3, { message: username.errors.minLength });
    maxLength(schemePath.username, 100, { message: username.errors.maxLength });

    required(schemePath.email, { message: email.errors.required });

    required(schemePath.contactInfo, { message: contactInfo.errors.required });

    required(schemePath.password, { message: password.errors.required });
    minLength(schemePath.password, 8, { message: password.errors.minLength });
    required(schemePath.confirmPassword, {
      message: confirmPassword.errors.required,
    });
    validateTree(schemePath, (model) => {
      if (
        model.valueOf(schemePath.password) ===
        model.valueOf(schemePath.confirmPassword)
      ) {
        return null;
      }

      return {
        fieldTree: model.fieldTree.confirmPassword,
        kind: "passwordMismatch",
        message: confirmPassword.errors.mismatch,
      };
    });
  });

  ngOnInit(): void {
    this.submitter
      .pipe(
        exhaustMap((payload) => from(this.sendRequest(payload))),
        takeUntil(this.destroyer)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroyer.next();
    this.destroyer.complete();
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    await submit(this.registerForm, async (schemaPath) => {
      this.isLoading.set(true);
      const registerTenant: RegisterTenant = this.getRegisterModel();
      this.submitter.next({ registerTenant, schemaPath });
      await Promise.resolve();
    });
  }

  private getRegisterModel(): RegisterTenant {
    return {
      companyName: this.registerModel().companyName,
      user: {
        contactInfo: this.registerModel().contactInfo,
        email: this.registerModel().email,
        fullName: this.registerModel().username,
        password: this.registerModel().password,
      },
    };
  }

  onError(key: keyof RegisterSchema) {
    const field = this.registerForm[key]();

    return field.touched() && field.invalid() ? field.errors() : [];
  }

  private async sendRequest({ registerTenant, schemaPath }: RegisterPayload) {
    try {
      await firstValueFrom(this.tenantService.registerTenant(registerTenant));
      this.router.navigate([APP_ROUTES.auth.login]);
      return [];
    } catch (error) {
      /* SAFETY: Error caught from HTTP call is cast to RawErrorPayload for type guard narrowing */
      const rawError = error as RawErrorPayload;
      if (isResponseError(rawError)) {
        return [
          {
            fieldTree: schemaPath.email,
            kind: "emailExists",
            message: rawError.error,
          },
        ];
      }
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }
}
