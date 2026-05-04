import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { mobileGuardGuard } from './mobile-guard-guard';

describe('mobileGuardGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => mobileGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
