import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { ToastData, ToastsComponent } from "./toast";
import { HotToastService, provideHotToastConfig } from "@ngxpert/hot-toast";
import { Component, inject, signal } from "@angular/core";
import { ButtonComponent } from "../button/button";
import { ToastService } from "./toast.service";
import { Observable } from "rxjs";

@Component({
  selector: "toast-story",
  imports: [ButtonComponent],
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
    type: "success",
    message: "This is the content of the toast message.",
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
      loading: {
        type: "loading",
        message: "Loading data...",
      },
      success: {
        type: "success",
        message: "Data loaded successfully!",
      },
      error: {
        type: "error",
        message: "Failed to load data.",
      },
    });
  }
}

const meta: Meta<ToastsComponent> = {
  title: "Components/Toasts",
  component: ToastStoryComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideHotToastConfig({
          position: "top-right",
          style: {
            padding: "0px",
            background: "var(--background)",
            border: "1px solid var(--border)",
          },
        }),
      ],
    }),
    moduleMetadata({
      providers: [],
    }),
  ],
};

export default meta;
type Story = StoryObj<ToastsComponent>;

export const Base: Story = {};
