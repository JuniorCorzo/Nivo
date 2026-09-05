import { inject, Injectable } from "@angular/core";
import { HotToastService } from "@ngxpert/hot-toast";
import type { Observable } from "rxjs";

import type { ToastData, ToastObservableData } from "./toast";
import { ToastsComponent } from "./toast";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private hotToastService = inject(HotToastService);

  showToast(data: ToastData) {
    this.hotToastService.show(ToastsComponent, {
      data,
    });
  }

  showObservableToast<T>(
    observable$: Observable<T>,
    data: ToastObservableData
  ) {
    const toastRef = this.hotToastService.show(ToastsComponent, {
      data: data.loading,
    });

    observable$.subscribe({
      error: () => {
        toastRef.data = data.error;
        toastRef.updateToast({ type: "blank" });
      },
      next: () => {
        toastRef.data = data.success;
        toastRef.updateToast({ type: "blank" });
      },
    });
  }
}
