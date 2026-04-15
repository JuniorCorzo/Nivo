import { Component, computed, signal, WritableSignal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';
import { ButtonComponent } from '@nivo-sass/design-system';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';

@Component({
  selector: 'app-theme-button',
  imports: [NgIcon],
  providers: [provideIcons({ lucideSun, lucideMoon })],
  templateUrl: './theme-button.html',
  styleUrl: './theme-button.css',
})
export class ThemeButton {
  private currentTheme = signal<'light' | 'dark'>('dark');
  protected currentIcon = computed(() =>
    this.currentTheme() === 'dark' ? 'lucideMoon' : 'lucideSun',
  );
  protected themeLabel = APP_TEXTS.sidebar.theme.label;

  protected onClick() {
    if (!document.startViewTransition) this.toggleTheme(this.currentTheme);
    document.startViewTransition(this.toggleTheme.bind(this, this.currentTheme));
  }

  protected toggleTheme(currentTheme: WritableSignal<'light' | 'dark'>) {
    const prevTheme = currentTheme();
    this.currentTheme.set(prevTheme === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.remove(prevTheme);
    document.documentElement.classList.add(currentTheme());
  }
}
