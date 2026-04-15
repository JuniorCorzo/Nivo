import { Component, computed, inject } from '@angular/core';
import { UserService } from '@core/services/user/user-service';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.css',
})
export class UserMenu {
  protected user = inject(UserService).currentUser;
  protected textsSidebar = APP_TEXTS.sidebar;
  protected userProfileImage = computed(
    () => `https://ui-avatars.com/api/?name=${this.user()?.fullName.replaceAll(' ', '+')}`,
  );
}
