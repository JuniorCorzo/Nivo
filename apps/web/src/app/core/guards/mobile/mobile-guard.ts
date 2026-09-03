import { BreakpointObserver } from "@angular/cdk/layout";
import { inject } from "@angular/core";
import type { CanMatchFn } from "@angular/router";

export const mobileGuard: CanMatchFn = () =>
  inject(BreakpointObserver).isMatched("(max-width: 768px)");
