import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  selector: "app-layout-component",
  styleUrl: "./layout-component.css",
  templateUrl: "./layout-component.html",
})
export class LayoutComponent {
  protected readonly isReady = true;
}
