import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { ParkingSlotFormFacade } from "../../../../facades/parking-slot-form.facade";
import { ParkingSlotCreateForm } from "./parking-slot-create-form";

describe("ParkingSlotCreateForm", () => {
  let fixture: ComponentFixture<ParkingSlotCreateForm>;

  const mockFacade = {
    conflictMessage: signal<string | null>(null),
    form: {
      from: signal(1),
      prefix: signal("A"),
      status: signal("AVAILABLE"),
      to: signal(10),
      type: signal("CAR"),
      zone: signal("Norte"),
    },
    previewCount: signal(10),
    previewRange: signal("A-001 ... A-010"),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingSlotCreateForm],
    })
      .overrideComponent(ParkingSlotCreateForm, {
        set: {
          providers: [{ provide: ParkingSlotFormFacade, useValue: mockFacade }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ParkingSlotCreateForm);
    fixture.componentRef.setInput("parkingName", "Test Parking");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
