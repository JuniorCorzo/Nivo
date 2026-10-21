import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import type { UserModel } from "@core/models/user.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideUserCog, lucideUserX } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, NgIcon],
  providers: [
    provideIcons({
      lucideUserCog,
      lucideUserX,
    }),
  ],
  selector: "app-user-row-actions",
  standalone: true,
  template: `
    <div class="flex items-center justify-end gap-1.5">
      <nv-button
        type="button"
        variant="ghost"
        size="sm"
        [title]="texts.changeRole"
        [attr.aria-label]="texts.changeRole"
        (click)="onChangeRole()"
      >
        <ng-icon name="lucideUserCog" size="15" />
        <span class="hidden sm:inline">{{ texts.changeRole }}</span>
      </nv-button>
      <nv-button
        type="button"
        variant="ghost"
        size="sm"
        [disabled]="isSelf() || isInactive()"
        [title]="isSelf() ? deactivateSelfDisabledText : texts.deactivate"
        [attr.aria-label]="texts.deactivate"
        class="text-destructive hover:bg-destructive/10 hover:text-destructive"
        (click)="deactivate.emit(user())"
      >
        <ng-icon name="lucideUserX" size="15" />
        <span class="hidden sm:inline">{{ texts.deactivate }}</span>
      </nv-button>
    </div>
  `,
})
export class UserRowActionsComponent {
  readonly texts = APP_TEXTS.users.table.actions;
  readonly deactivateSelfDisabledText =
    APP_TEXTS.users.modals.deactivate.selfDeactivationWarning;
  readonly isSelf = input<boolean>(false);
  readonly user = input.required<UserModel>();

  readonly isInactive = computed(() => Boolean(this.user().deletedAt));

  readonly changeRole = output<UserModel>();
  readonly deactivate = output<UserModel>();

  onChangeRole(): void {
    this.changeRole.emit(this.user());
  }
}
