import { Component, inject, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideCheckCircle2,
  lucideInfo,
  lucideLoader,
  lucideXCircle,
} from "@ng-icons/lucide";
import { TypographyP } from "../typography";
import { HotToastRef, HotToastService } from "@ngxpert/hot-toast";
import { TypographySpan } from "../typography/typography";

export type ToastData = {
  title?: string;
  message: string;
  type: ToastType;
};

export type ToastObservableData = {
  loading: ToastData;
  success: ToastData;
  error: ToastData;
};

type ToastType = "success" | "error" | "info" | "warning" | "loading";

@Component({
  selector: "nv-toast-icon",
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideInfo,
      lucideXCircle,
      lucideLoader,
    }),
  ],
  template: `<ng-icon
    [name]="icon()"
    [color]="color()"
    [class.animate-spin]="icon() === 'lucideLoader'"
    size="24"
  />`,
  styleUrl: "./toast.css",
})
export class ToastIconComponent {
  icon = input<string>();
  color = input<string>();
}

@Component({
  selector: "nv-toast",
  imports: [TypographyP, TypographySpan, ToastIconComponent],
  template: `
    <div class="bg-(--background) flex flex-col gap-2">
      @if (toastRef.data.title) {
        <span
          class="flex items-center gap-2 w-full py-1 border-0 border-b border-(--border)"
        >
          <nv-toast-icon
            class=""
            [icon]="this.iconMap[this.toastRef.data.type]['icon']"
            [color]="this.iconMap[this.toastRef.data.type]['color']"
          />
          <nv-span class="text-xl">{{ toastRef.data.title }}</nv-span>
        </span>
        <nv-p>{{ toastRef.data.message }}</nv-p>
      } @else {
        <span class="flex items-center gap-2 w-full ">
          <nv-toast-icon
            style="max-height: 24px;"
            [icon]="this.iconMap[this.toastRef.data.type]['icon']"
            [color]="this.iconMap[this.toastRef.data.type]['color']"
          />
          <nv-span class="text-base">{{ toastRef.data.message }}</nv-span>
        </span>
      }
    </div>
  `,
  styleUrl: "./toast.css",
})
export class ToastsComponent {
  protected toastService = inject(HotToastService);
  toastRef = inject<HotToastRef<ToastData>>(HotToastRef<ToastData>);

  protected iconMap = {
    info: {
      icon: "lucideInfo",
      color: "var(--semantic-info)",
    },
    success: {
      icon: "lucideCheckCircle2",
      color: "var(--semantic-success)",
    },
    error: {
      icon: "lucideXCircle",
      color: "var(--semantic-error)",
    },
    warning: {
      icon: "lucideAlertCircle",
      color: "var(--semantic-warning)",
    },
    loading: {
      icon: "lucideLoader",
      color: "var(--foreground)",
    },
  };
}
