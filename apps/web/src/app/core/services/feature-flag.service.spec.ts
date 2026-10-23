import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideApiConfiguration } from "@core/api/generated/api-configuration";

import { FeatureFlagService } from "./feature-flag.service";

describe("FeatureFlagService", () => {
  let service: FeatureFlagService;
  let httpTesting: HttpTestingController;

  afterEach(() => {
    httpTesting.verify();
  });

  it("should initialize with false by default and update when remote config responds", () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApiConfiguration("http://localhost:8080/api"),
        FeatureFlagService,
      ],
    });

    service = TestBed.inject(FeatureFlagService);
    httpTesting = TestBed.inject(HttpTestingController);

    expect(service.accountCreationEnabled()).toBe(false);

    service.loadRemoteConfig().subscribe();

    const req = httpTesting.expectOne(
      "http://localhost:8080/api/public/config"
    );
    expect(req.request.method).toBe("GET");
    req.flush({ accountCreationEnabled: true });

    expect(service.accountCreationEnabled()).toBe(true);
  });

  it("should handle error gracefully and remain false", () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApiConfiguration("http://localhost:8080/api"),
        FeatureFlagService,
      ],
    });

    service = TestBed.inject(FeatureFlagService);
    httpTesting = TestBed.inject(HttpTestingController);

    expect(service.accountCreationEnabled()).toBe(false);

    service.loadRemoteConfig().subscribe();

    const req = httpTesting.expectOne(
      "http://localhost:8080/api/public/config"
    );
    req.error(new ProgressEvent("Network error"));

    expect(service.accountCreationEnabled()).toBe(false);
  });
});
