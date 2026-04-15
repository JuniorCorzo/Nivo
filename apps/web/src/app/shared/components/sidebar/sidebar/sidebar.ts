import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCar, lucideLayoutDashboard } from '@ng-icons/lucide';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { UserMenu } from '@shared/components/user-menu/user-menu';
import { filter } from 'rxjs';
import { SidebarFooter } from '@shared/components/sidebar-footer/sidebar-footer';

@Component({
  selector: 'app-sidebar',
  imports: [NgIcon, SidebarFooter],
  providers: [provideIcons({ lucideLayoutDashboard, lucideCar })],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  protected navItems = signal(APP_TEXTS.sidebar.nav.map((item) => ({ ...item, isActive: false })));
  private route = inject(Router);

  ngOnInit(): void {
    this.setActiveItem(this.route.url.split('?', 1)[0]);

    this.route.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.setActiveItem((event as NavigationEnd).urlAfterRedirects);
    });
  }

  private setActiveItem(url: string) {
    this.navItems.update((items) =>
      items.map((item) => ({ ...item, isActive: item.url.includes(url) })),
    );
  }
}
