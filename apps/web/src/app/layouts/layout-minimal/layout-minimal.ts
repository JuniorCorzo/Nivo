import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  selector: "app-layout-minimal",
  template: `
    <div class="flex">
      <main class="flex-1">
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutMinimal {
  protected readonly isReady = true;
}
