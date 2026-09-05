import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  selector: "app-dashboard-page",
  styleUrl: "./dashboard-page.css",
  templateUrl: "./dashboard-page.html",
})
export class DashboardPage {
  protected readonly isReady = true;
}
