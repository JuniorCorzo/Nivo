import { Component, inject, input } from '@angular/core';
import { AuthService } from '@core/services/auth-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut } from '@ng-icons/lucide';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';

@Component({
  selector: 'app-logout-button',
  imports: [NgIcon],
  providers: [provideIcons({ lucideLogOut })],
  templateUrl: './logout-button.html',
  styleUrl: './logout-button.css',
})
export class LogoutButton {
  readonly collapsed = input(false);
  protected logoutLabel = APP_TEXTS.sidebar.logout;
  private authService = inject(AuthService);

  onClick() {
    this.authService.logout();
  }
}
