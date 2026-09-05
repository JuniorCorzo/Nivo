import type { HttpInterceptorFn } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";

import { authInterceptor } from "./auth-interceptor";

const interceptor: HttpInterceptorFn = (req, next) =>
  TestBed.runInInjectionContext(() => authInterceptor(req, next));

describe("authInterceptor", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("should be created", () => {
    expect(interceptor).toBeTruthy();
  });
});
