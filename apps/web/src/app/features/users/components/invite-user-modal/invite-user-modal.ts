import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UserService } from "@core/services/user/user-service";
import type { Role } from "@core/type/role.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideMail,
  lucidePhone,
  lucideUser,
  lucideUserPlus,
  lucideX,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  InputComponent,
  SelectComponent,
  ToastService,
  TypographyH3,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

export interface RoleOption {
  label: string;
  value: Role;
}

const displayRoleOption = (item: RoleOption): string => item.label;
const roleOptionValue = (item: RoleOption): string => item.value;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    InputComponent,
    NgIcon,
    ReactiveFormsModule,
    SelectComponent,
    TypographyH3,
  ],
  providers: [
    provideIcons({
      lucideMail,
      lucidePhone,
      lucideUser,
      lucideUserPlus,
      lucideX,
    }),
  ],
  selector: "app-invite-user-modal",
  standalone: true,
  templateUrl: "./invite-user-modal.html",
})
export class InviteUserModalComponent {
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly closed = output();
  readonly invited = output();

  readonly isSubmitting = signal<boolean>(false);
  readonly texts = APP_TEXTS.users.modals.invite;

  readonly roleOptions: RoleOption[] = [
    { label: APP_TEXTS.users.table.roles.operator, value: "OPERATOR" },
    { label: APP_TEXTS.users.table.roles.manager, value: "MANAGER" },
  ];

  readonly displayRole = displayRoleOption;
  readonly roleValue = roleOptionValue;

  readonly form = new FormGroup({
    contactInfo: new FormControl<string>("", { nonNullable: true }),
    email: new FormControl<string>("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    fullName: new FormControl<string>("", {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    role: new FormControl<Role>("OPERATOR", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  @HostListener("document:keydown.escape", ["$event"])
  onKeydownEscape(event: Event): void {
    if (this.isOpen()) {
      event.stopPropagation();
      this.onCancel();
    }
  }

  onRoleChange(newRole: string): void {
    /* SAFETY: SelectComponent emits string, typed as Role */
    this.form.controls.role.setValue(newRole as Role);
  }

  onCancel(): void {
    this.form.reset({
      contactInfo: "",
      email: "",
      fullName: "",
      role: "OPERATOR",
    });
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, fullName, role } = this.form.getRawValue();
    this.isSubmitting.set(true);

    this.userService.inviteUser(email, role, fullName).subscribe({
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.showToast({
          message: APP_TEXTS.users.toasts.inviteError,
          type: "error",
        });
      },
      next: () => {
        this.isSubmitting.set(false);
        this.toastService.showToast({
          message: APP_TEXTS.users.toasts.inviteSuccess,
          type: "success",
        });
        this.form.reset({
          contactInfo: "",
          email: "",
          fullName: "",
          role: "OPERATOR",
        });
        this.invited.emit();
        this.closed.emit();
      },
    });
  }
}
