import { HttpErrorResponse, HttpRequest } from "@angular/common/http";
import type { HttpInterceptorFn } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { ToastService } from "@nivo-sass/design-system";
import { throwError } from "rxjs";

import { errorInterceptor } from "./error-interceptor";

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

const interceptor: HttpInterceptorFn = (req, next) =>
  TestBed.runInInjectionContext(() => errorInterceptor(req, next));

describe("errorInterceptor", () => {
  let toastSpy: MockToastService;

  beforeEach(() => {
    toastSpy = { showToast: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: ToastService, useValue: toastSpy }],
    });
  });

  it("should be created", () => {
    expect(interceptor).toBeTruthy();
  });

  it("should use response.message when available for 404", () => {
    const req = new HttpRequest("GET", "/test");
    const error = new HttpErrorResponse({
      error: { message: "Plaza no encontrada" },
      status: 404,
    });

    interceptor(req, () => throwError(() => error)).subscribe({
      error: () => {},
    });

    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "Plaza no encontrada",
      type: "error",
    });
  });

  it("should fallback to default message for 404 when response has no message", () => {
    const req = new HttpRequest("GET", "/test");
    const error = new HttpErrorResponse({
      error: {},
      status: 404,
    });

    interceptor(req, () => throwError(() => error)).subscribe({
      error: () => {},
    });

    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: expect.any(String),
      type: "error",
    });
  });

  it("should use response.message for 409 conflict", () => {
    const req = new HttpRequest("POST", "/test", {});
    const error = new HttpErrorResponse({
      error: { message: "Existen plazas ocupadas en el grupo" },
      status: 409,
    });

    interceptor(req, () => throwError(() => error)).subscribe({
      error: () => {},
    });

    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "Existen plazas ocupadas en el grupo",
      type: "error",
    });
  });

  it("should use default conflict message for 409 when response has no message", () => {
    const req = new HttpRequest("POST", "/test", {});
    const error = new HttpErrorResponse({
      error: {},
      status: 409,
    });

    interceptor(req, () => throwError(() => error)).subscribe({
      error: () => {},
    });

    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message:
        "No se puede realizar la operación porque los recursos están ocupados o en conflicto.",
      type: "error",
    });
  });

  it("should use response.message for 400 bad request", () => {
    const req = new HttpRequest("POST", "/test", {});
    const error = new HttpErrorResponse({
      error: { message: "prefix: must not be blank" },
      status: 400,
    });

    interceptor(req, () => throwError(() => error)).subscribe({
      error: () => {},
    });

    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "prefix: must not be blank",
      type: "error",
    });
  });

  it("should not toast for 401 unauthorized", () => {
    const req = new HttpRequest("GET", "/test");
    const error = new HttpErrorResponse({
      error: { message: "Unauthorized" },
      status: 401,
    });

    interceptor(req, () => throwError(() => error)).subscribe({
      error: () => {},
    });

    expect(toastSpy.showToast).not.toHaveBeenCalled();
  });
});
