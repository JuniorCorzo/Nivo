import { BreakpointObserver } from '@angular/cdk/layout';
import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';

export const mobileGuard: CanMatchFn = (route, segments) => {
  return inject(BreakpointObserver).isMatched('(max-width: 768px)');
};
