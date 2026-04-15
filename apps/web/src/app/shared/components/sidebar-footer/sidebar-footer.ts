import { Component } from '@angular/core';
import { UserMenu } from '../user-menu/user-menu';
import { ThemeButton } from '../theme-button/theme-button';
import { LogoutButton } from '../logout-button/logout-button';

@Component({
  selector: 'app-sidebar-footer',
  imports: [UserMenu, ThemeButton, LogoutButton],
  templateUrl: './sidebar-footer.html',
  styleUrl: './sidebar-footer.css',
})
export class SidebarFooter {}
