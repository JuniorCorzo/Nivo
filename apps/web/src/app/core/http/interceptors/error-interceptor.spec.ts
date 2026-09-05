import type { HttpInterceptorFn } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";

import { errorInterceptor } from "./error-interceptor";

const interceptor: HttpInterceptorFn = (req, next) =>
  TestBed.runInInjectionContext(() => errorInterceptor(req, next));

describe("errorInterceptor", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("should be created", () => {
    expect(interceptor).toBeTruthy();
  });
});
