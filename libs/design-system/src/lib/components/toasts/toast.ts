import { Component, inject, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideCheckCircle2,
  lucideInfo,
  lucideLoader,
  lucideXCircle,
} from "@ng-icons/lucide";
import { HotToastRef, HotToastService } from "@ngxpert/hot-toast";

import { TypographyP } from "../typography";
import { TypographySpan } from "../typography/typography";

export interface ToastData {
  title?: string;
  message: string;
  type: ToastType;
}

export interface ToastObservableData {
  loading: ToastData;
  success: ToastData;
  error: ToastData;
}

type ToastType = "success" | "error" | "info" | "warning" | "loading";

@Component({
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideCheckCircle2,
      lucideInfo,
      lucideLoader,
      lucideXCircle,
    }),
  ],
  selector: "nv-toast-icon",
  styleUrl: "./toast.css",
  template: `<ng-icon
    [name]="icon()"
    [color]="color()"
    [class.animate-spin]="icon() === 'lucideLoader'"
    size="24"
  />`,
})
export class ToastIconComponent {
  icon = input<string>();
  color = input<string>();
}

@Component({
  imports: [TypographyP, TypographySpan, ToastIconComponent],
  selector: "nv-toast",
  styleUrl: "./toast.css",
  template: `
    <div class="flex flex-col gap-2 bg-(--background)">
      @if (toastRef.data.title) {
        <span
          class="flex w-full items-center gap-2 border-0 border-b border-(--border) py-1"
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
        <span class="flex w-full items-center gap-2">
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
})
export class ToastsComponent {
  protected toastService = inject(HotToastService);
  toastRef = inject<HotToastRef<ToastData>>(HotToastRef<ToastData>);

  protected iconMap = {
    error: {
      color: "var(--semantic-error)",
      icon: "lucideXCircle",
    },
    info: {
      color: "var(--semantic-info)",
      icon: "lucideInfo",
    },
    loading: {
      color: "var(--foreground)",
      icon: "lucideLoader",
    },
    success: {
      color: "var(--semantic-success)",
      icon: "lucideCheckCircle2",
    },
    warning: {
      color: "var(--semantic-warning)",
      icon: "lucideAlertCircle",
    },
  };
}
