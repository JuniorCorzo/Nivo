import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { mobileGuard } from './mobile-guard';

describe('mobileGuardGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => mobileGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
