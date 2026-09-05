import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { ActionsColumn } from "./actions-column";

describe("ActionsColumn", () => {
  let component: ActionsColumn;
  let fixture: ComponentFixture<ActionsColumn>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActiveParkingService: jasmine.SpyObj<ActiveParkingService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj<Router>("Router", ["navigate"]);
    mockActiveParkingService = jasmine.createSpyObj<ActiveParkingService>(
      "ActiveParkingService",
      ["setActiveParkingId"]
    );

    await TestBed.configureTestingModule({
      imports: [ActionsColumn],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActiveParkingService, useValue: mockActiveParkingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsColumn);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("parkingId", "parking-123");
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should set active parking and navigate on onViewDetails", () => {
    component.onViewDetails();
    expect(mockActiveParkingService.setActiveParkingId).toHaveBeenCalledWith(
      "parking-123"
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      APP_ROUTES.app.parkingLots,
    ]);
  });

  it("should navigate on onEdit", () => {
    component.onEdit();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      APP_ROUTES.app.editParkingLots("parking-123"),
    ]);
  });

  it("should emit deleteClick on onDelete", () => {
    const emitSpy = spyOn(component.deleteClick, "emit");
    component.onDelete();
    expect(emitSpy).toHaveBeenCalledWith("parking-123");
  });
});
