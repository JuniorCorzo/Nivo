import { Component, computed, inject, input } from "@angular/core";
import { UserService } from "@core/services/user/user-service";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  selector: "app-user-menu",
  standalone: true,
  styleUrl: "./user-menu.css",
  templateUrl: "./user-menu.html",
})
export class UserMenu {
  readonly collapsed = input(false);
  protected user = inject(UserService).currentUser;
  protected textsSidebar = APP_TEXTS.sidebar;
  protected userProfileImage = computed(
    () =>
      `https://ui-avatars.com/api/?name=${this.user()?.fullName.replaceAll(" ", "+")}`
  );
}
