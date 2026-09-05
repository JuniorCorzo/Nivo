import { Component, inject, signal } from "@angular/core";
import { provideHotToastConfig } from "@ngxpert/hot-toast";
import type { Meta, StoryObj } from "@storybook/angular";
import { applicationConfig, moduleMetadata } from "@storybook/angular";
import { Observable } from "rxjs";

import { ButtonComponent } from "../button/button";
import type { ToastData, ToastsComponent } from "./toast";
import { ToastService } from "./toast.service";

@Component({
  imports: [ButtonComponent],
  selector: "toast-story",
  template: `
    <div class="inline-flex gap-2">
      <nv-button (click)="this.showToast()">Show Toast</nv-button>
      <nv-button (click)="this.showObservableToast()"
        >Show Observable Toast</nv-button
      >
    </div>
  `,
})
class ToastStoryComponent {
  tostService = inject(ToastService);
  toastData = signal<ToastData>({
    message: "This is the content of the toast message.",
    type: "success",
  });

  showToast() {
    this.tostService.showToast(this.toastData());
  }

  showObservableToast() {
    const observable$ = new Observable<string>((observer) => {
      setTimeout(() => {
        observer.next("Data loaded successfully!");
        observer.complete();
      }, 2000);
    });

    this.tostService.showObservableToast(observable$, {
      error: {
        message: "Failed to load data.",
        type: "error",
      },
      loading: {
        message: "Loading data...",
        type: "loading",
      },
      success: {
        message: "Data loaded successfully!",
        type: "success",
      },
    });
  }
}

const meta: Meta<ToastsComponent> = {
  component: ToastStoryComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideHotToastConfig({
          position: "top-right",
          style: {
            background: "var(--background)",
            border: "1px solid var(--border)",
            padding: "0px",
          },
        }),
      ],
    }),
    moduleMetadata({
      providers: [],
    }),
  ],
  title: "Components/Toasts",
};

export default meta;
type Story = StoryObj<ToastsComponent>;

export const Base: Story = {};
