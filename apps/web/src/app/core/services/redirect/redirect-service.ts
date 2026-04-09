import { computed, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RedirectService {
  private redirectUrl: WritableSignal<string | null> = signal(null);
  public hasRedirectUrl = computed(() => !!this.redirectUrl());

  saveRedirectUrl(route: ActivatedRouteSnapshot) {
    this.redirectUrl.set(route.url.map((segment) => segment.path).join('/'));
  }

  getRedirectUrl(): string | null {
    const redirectUrlLocal = this.redirectUrl();
    this.redirectUrl.set(null);

    return redirectUrlLocal;
  }
}
