import { TestBed } from "@angular/core/testing";
import type { CanActivateFn } from "@angular/router";

import { publicGuard } from "./public-guard";

const executeGuard: CanActivateFn = (...guardParameters) =>
  TestBed.runInInjectionContext(() => publicGuard(...guardParameters));

describe("publicGuard", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("should be created", () => {
    expect(executeGuard).toBeTruthy();
  });
});
