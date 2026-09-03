import type { HttpInterceptorFn } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";

import { addWithCredentialsInterceptor } from "./add-with-credentials.interceptor";

const interceptor: HttpInterceptorFn = (req, next) =>
  TestBed.runInInjectionContext(() => addWithCredentialsInterceptor(req, next));

describe("addWithCredentialsInterceptorInterceptor", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("should be created", () => {
    expect(interceptor).toBeTruthy();
  });
});
