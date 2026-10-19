import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { UserModel } from "@core/models/user.model";
import { AvatarComponent } from "@nivo-sass/design-system";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent],
  selector: "app-user-info-cell",
  standalone: true,
  template: `
    <div class="flex items-center gap-3">
      <nv-avatar [name]="user().fullName" size="sm" />
      <div class="flex min-w-0 flex-col">
        <span class="truncate text-sm font-medium text-foreground">
          {{ user().fullName }}
        </span>
        <span class="truncate text-xs text-muted-foreground">
          {{ user().email }}
        </span>
      </div>
    </div>
  `,
})
export class UserInfoCellComponent {
  readonly user = input.required<UserModel>();
}
