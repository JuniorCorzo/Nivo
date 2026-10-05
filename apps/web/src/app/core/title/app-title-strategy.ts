import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import type { RouterStateSnapshot } from "@angular/router";
import { TitleStrategy } from "@angular/router";

@Injectable({ providedIn: "root" })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(routerState: RouterStateSnapshot): void {
    const title = this.buildTitle(routerState);
    if (title) {
      this.title.setTitle(`${title} - Nivo`);
    } else {
      this.title.setTitle("Nivo");
    }
  }
}
