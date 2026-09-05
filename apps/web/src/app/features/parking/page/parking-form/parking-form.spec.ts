import "@angular/compiler";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router, provideRouter } from "@angular/router";
import type { ParkingLotsModel } from "@core/models/parking.model";
import { ColombiaService } from "@core/service/colombia-service";
import { ParkingService } from "@core/services/parking-service";
import { of } from "rxjs";

import { ParkingFormComponent } from "./parking-form";

interface MockParkingService {
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  getUpsertById: ReturnType<typeof vi.fn>;
  deleteSlotGroup: ReturnType<typeof vi.fn>;
}

describe("ParkingFormComponent", () => {
  let component: ParkingFormComponent;
  let fixture: ComponentFixture<ParkingFormComponent>;
  let mockParkingService: MockParkingService;
  let mockColombiaService: Partial<ColombiaService>;
  let router: Router;

  const mockCreatedLot: ParkingLotsModel = {
    address: {
      city: "Bogotá",
      country: "Colombia",
      state: "Cundinamarca",
      street: "Cll 100",
      zipCode: "110111",
    },
    coordinates: { latitude: 4.6, longitude: -74 },
    createdAt: new Date(),
    currency: "COP",
    id: "new-lot",
    name: "Nuevo",
    operatingHours: { closeTime: "20:00:00-05:00", openTime: "08:00:00-05:00" },
    owner: {
      contactInfo: "123",
      email: "a@b.com",
      fullName: "Owner",
      id: "u1",
      role: "OWNER",
    },
    tenant: { companyName: "Tenant", id: "t1" },
    timezone: "UTC-05:00",
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockParkingService = {
      create: vi.fn().mockReturnValue(of(mockCreatedLot)),
      deleteSlotGroup: vi.fn(),
      getUpsertById: vi.fn().mockReturnValue(
        of({
          address: {
            city: "Bogotá",
            country: "Colombia",
            state: "Cundinamarca",
            street: "Cll 100",
            zipCode: "110111",
          },
          coordinates: { latitude: 4.6, longitude: -74 },
          currency: "COP",
          name: "Test",
          operatingHours: {
            closeTime: "20:00:00-05:00",
            openTime: "08:00:00-05:00",
          },
          timezone: "UTC-05:00",
        })
      ),
      update: vi.fn(),
    };

    mockColombiaService = {
      departaments: signal(["Cundinamarca"]),
      getCitiesByDepartmentName: vi.fn().mockReturnValue(["Bogotá"]),
    };

    await TestBed.configureTestingModule({
      imports: [ParkingFormComponent],
      providers: [
        provideRouter([]),
        { provide: ParkingService, useValue: mockParkingService },
        { provide: ColombiaService, useValue: mockColombiaService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === "parkingId" ? null : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, "navigate").mockReturnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(ParkingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create component instance", () => {
    expect(component).toBeTruthy();
  });

  it("should navigate back on onCancel", () => {
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(["/app/parking-lots"]);
  });
});
