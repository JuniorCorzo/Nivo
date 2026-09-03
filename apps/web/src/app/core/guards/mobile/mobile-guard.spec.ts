import { TestBed } from "@angular/core/testing";
import type { CanMatchFn } from "@angular/router";

import { mobileGuard } from "./mobile-guard";

const executeGuard: CanMatchFn = (...guardParameters) =>
  TestBed.runInInjectionContext(() => mobileGuard(...guardParameters));

describe("mobileGuardGuard", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("should be created", () => {
    expect(executeGuard).toBeTruthy();
  });
});
