import type { WritableSignal } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMoon, lucideSun } from "@ng-icons/lucide";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [provideIcons({ lucideMoon, lucideSun })],
  selector: "app-theme-button",
  styleUrl: "./theme-button.css",
  templateUrl: "./theme-button.html",
})
export class ThemeButton {
  readonly collapsed = input(false);
  private currentTheme = signal<"light" | "dark">("dark");
  protected currentIcon = computed(() =>
    this.currentTheme() === "dark" ? "lucideMoon" : "lucideSun"
  );
  protected themeLabel = APP_TEXTS.sidebar.theme.label;

  protected onClick() {
    if (!document.startViewTransition) {
      this.toggleTheme(this.currentTheme);
      return;
    }

    document.documentElement.classList.add("theme-transition");
    const transition = document.startViewTransition(() => {
      this.toggleTheme(this.currentTheme);
    });

    // eslint-disable-next-line promise/prefer-await-to-then
    transition.finished.finally(() => {
      document.documentElement.classList.remove("theme-transition");
    });
  }

  protected toggleTheme(currentTheme: WritableSignal<"light" | "dark">) {
    const prevTheme = currentTheme();
    this.currentTheme.set(prevTheme === "dark" ? "light" : "dark");
    document.documentElement.classList.remove(prevTheme);
    document.documentElement.classList.add(currentTheme());
  }
}
