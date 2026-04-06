import { inject, Injectable } from "@angular/core";
import { HotToastService } from "@ngxpert/hot-toast";
import { ToastData, ToastObservableData, ToastsComponent } from "./toast";
import { Observable } from "rxjs";

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
    data: ToastObservableData,
  ) {
    const toastRef = this.hotToastService.show(ToastsComponent, {
      data: data.loading,
    });

    observable$.subscribe({
      next: () => {
        toastRef.data = data.success;
        toastRef.updateToast({ type: "blank" });
      },
      error: () => {
        toastRef.data = data.error;
        toastRef.updateToast({ type: "blank" });
      },
    });
  }
}
