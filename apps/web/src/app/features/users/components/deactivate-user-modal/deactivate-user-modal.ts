import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import type { UserModel } from "@core/models/user.model";
import { UserService } from "@core/services/user/user-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertTriangle, lucideUserX, lucideX } from "@ng-icons/lucide";
import {
  ButtonComponent,
  ToastService,
  TypographyH3,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, NgIcon, TypographyH3],
  providers: [
    provideIcons({
      lucideAlertTriangle,
      lucideUserX,
      lucideX,
    }),
  ],
  selector: "app-deactivate-user-modal",
  standalone: true,
  styleUrl: "./deactivate-user-modal.css",
  templateUrl: "./deactivate-user-modal.html",
})
export class DeactivateUserModalComponent implements OnDestroy {
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly user = input<UserModel | null>(null);

  readonly closed = output();
  readonly deactivated = output();

  readonly isSubmitting = signal<boolean>(false);
  readonly texts = APP_TEXTS.users.modals.deactivate;

  readonly currentUser = this.userService.currentUser;
  readonly users = this.userService.users;

  protected readonly titleId = "deactivate-user-title";
  protected readonly descriptionId = "deactivate-user-description";

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>("dialog");

  readonly isSelfDeactivation = computed(() => {
    const current = this.currentUser();
    const target = this.user();
    return Boolean(current && target && current.id === target.id);
  });

  readonly isSoleOwner = computed(() => {
    const target = this.user();
    if (!target || target.role !== "OWNER") {
      return false;
    }
    const activeOwners = this.users().filter(
      (u) => u.role === "OWNER" && !u.deletedAt
    );
    return activeOwners.length <= 1;
  });

  readonly canDeactivate = computed(
    () => !this.isSelfDeactivation() && !this.isSoleOwner()
  );

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

  onCancel(event?: Event): void {
    event?.preventDefault();
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) {
      this.onCancel();
    }
  }

  onConfirm(): void {
    const target = this.user();
    if (!target || !this.canDeactivate()) {
      return;
    }

    this.isSubmitting.set(true);

    this.userService.deactivateUser(target.id).subscribe({
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.showToast({
          message: APP_TEXTS.users.toasts.deactivateError,
          type: "error",
        });
      },
      next: () => {
        this.isSubmitting.set(false);
        this.toastService.showToast({
          message: APP_TEXTS.users.toasts.deactivateSuccess,
          type: "success",
        });
        this.deactivated.emit();
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
