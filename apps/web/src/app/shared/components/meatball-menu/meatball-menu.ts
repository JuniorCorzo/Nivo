import type { ConnectedPosition } from "@angular/cdk/overlay";
import { OverlayModule } from "@angular/cdk/overlay";
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  signal,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideEllipsis } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";

export interface MeatballMenuItem {
  label: string;
  icon?: string;
  variant?: "default" | "destructive";
  action?: () => void;
  disabled?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule, ButtonComponent, NgIcon],
  providers: [provideIcons({ lucideEllipsis })],
  selector: "app-meatball-menu",
  styleUrl: "./meatball-menu.css",
  templateUrl: "./meatball-menu.html",
})
export class MeatballMenu {
  readonly items = input<MeatballMenuItem[]>();
  readonly variant = input<"default" | "secondary" | "outline" | "ghost">(
    "outline"
  );
  readonly size = input<"sm" | "md" | "lg" | "icon">("icon");
  readonly ariaLabel = input<string>("Más opciones");

  readonly isOpen = signal(false);

  readonly overlayPositions: ConnectedPosition[] = [
    {
      offsetY: 4,
      originX: "end",
      originY: "bottom",
      overlayX: "end",
      overlayY: "top",
    },
    {
      offsetY: -4,
      originX: "end",
      originY: "top",
      overlayX: "end",
      overlayY: "bottom",
    },
    {
      offsetY: 4,
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
    {
      offsetY: -4,
      originX: "start",
      originY: "top",
      overlayX: "start",
      overlayY: "bottom",
    },
  ];

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onItemClick(item: MeatballMenuItem): void {
    if (item.disabled) {
      return;
    }
    item.action?.();
    this.close();
  }

  @HostListener("window:keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.isOpen()) {
      this.close();
    }
  }
}
