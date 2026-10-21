import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
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

const VALID_ROLES = new Set<string>([
  "SUPERADMIN",
  "OWNER",
  "MANAGER",
  "OPERATOR",
  "DRIVER",
  "AUDITOR",
]);

export const isRole = (val: unknown): val is Role =>
  typeof val === "string" && VALID_ROLES.has(val);

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
  styleUrl: "./invite-user-modal.css",
  templateUrl: "./invite-user-modal.html",
})
export class InviteUserModalComponent implements OnDestroy {
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly closed = output();
  readonly invited = output();

  readonly isSubmitting = signal<boolean>(false);
  readonly texts = APP_TEXTS.users.modals.invite;

  protected readonly titleId = "invite-user-title";
  protected readonly descriptionId = "invite-user-description";

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>("dialog");

  readonly roleOptions: RoleOption[] = [
    { label: APP_TEXTS.users.table.roles.operator, value: "OPERATOR" },
    { label: APP_TEXTS.users.table.roles.manager, value: "MANAGER" },
    { label: APP_TEXTS.users.table.roles.auditor, value: "AUDITOR" },
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

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const dialogEl = this.dialog()?.nativeElement;
      if (!dialogEl) {
        return;
      }
      if (open && !dialogEl.open) {
        dialogEl.showModal();
      } else if (!open && dialogEl.open) {
        dialogEl.close();
      }
    });
  }

  onRoleChange(newRole: unknown): void {
    if (isRole(newRole)) {
      this.form.controls.role.setValue(newRole);
    }
  }

  onCancel(event?: Event): void {
    event?.preventDefault();
    this.form.reset({
      contactInfo: "",
      email: "",
      fullName: "",
      role: "OPERATOR",
    });
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) {
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

  ngOnDestroy(): void {
    const dialogEl = this.dialog()?.nativeElement;
    if (dialogEl?.open) {
      dialogEl.close();
    }
  }
}
