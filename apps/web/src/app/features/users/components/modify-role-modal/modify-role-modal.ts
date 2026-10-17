import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import type { UserModel } from "@core/models/user.model";
import { UserService } from "@core/services/user/user-service";
import type { Role } from "@core/type/role.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertTriangle,
  lucideShieldCheck,
  lucideUser,
  lucideX,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  SelectComponent,
  ToastService,
  TypographyH3,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { UserRoleBadgeComponent } from "../users-table/user-role-badge";

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
    NgIcon,
    SelectComponent,
    TypographyH3,
    UserRoleBadgeComponent,
  ],
  providers: [
    provideIcons({
      lucideAlertTriangle,
      lucideShieldCheck,
      lucideUser,
      lucideX,
    }),
  ],
  selector: "app-modify-role-modal",
  standalone: true,
  templateUrl: "./modify-role-modal.html",
})
export class ModifyRoleModalComponent {
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly user = input<UserModel | null>(null);

  readonly closed = output();
  readonly updated = output();

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedRole = signal<Role>("OPERATOR");
  readonly texts = APP_TEXTS.users.modals.modifyRole;

  readonly isOwner = computed(() => this.user()?.role === "OWNER");

  readonly roleOptions: RoleOption[] = [
    { label: APP_TEXTS.users.table.roles.operator, value: "OPERATOR" },
    { label: APP_TEXTS.users.table.roles.manager, value: "MANAGER" },
    { label: APP_TEXTS.users.table.roles.auditor, value: "AUDITOR" },
  ];

  readonly displayRole = displayRoleOption;
  readonly roleValue = roleOptionValue;

  constructor() {
    effect(() => {
      const u = this.user();
      untracked(() => {
        if (u) {
          if (u.role === "MANAGER" || u.role === "AUDITOR") {
            this.selectedRole.set(u.role);
          } else {
            this.selectedRole.set("OPERATOR");
          }
        }
      });
    });
  }

  @HostListener("document:keydown.escape", ["$event"])
  onKeydownEscape(event: Event): void {
    if (this.isOpen()) {
      event.stopPropagation();
      this.onCancel();
    }
  }

  onRoleChange(newRole: string): void {
    /* SAFETY: SelectComponent emits string, typed as Role */
    this.selectedRole.set(newRole as Role);
  }

  onCancel(): void {
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onSubmit(): void {
    const targetUser = this.user();
    if (!targetUser || this.isOwner()) {
      return;
    }

    this.isSubmitting.set(true);

    this.userService.modifyRole(targetUser.id, this.selectedRole()).subscribe({
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.showToast({
          message: APP_TEXTS.users.toasts.modifyRoleError,
          type: "error",
        });
      },
      next: () => {
        this.isSubmitting.set(false);
        this.toastService.showToast({
          message: APP_TEXTS.users.toasts.modifyRoleSuccess,
          type: "success",
        });
        this.updated.emit();
        this.closed.emit();
      },
    });
  }
}
