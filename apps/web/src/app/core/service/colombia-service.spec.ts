import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { ColombiaService } from "./colombia-service";

describe("ColombiaService", () => {
  let service: ColombiaService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ColombiaService);

    const req = httpTesting.expectOne("/assets/data/colombia.json");
    req.flush([]);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
