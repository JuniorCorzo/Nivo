import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { ParkingSlotFormFacade } from "../../../../facades/parking-slot-form.facade";
import { ParkingSlotEditForm } from "./parking-slot-edit-form";

describe("ParkingSlotEditForm", () => {
  let fixture: ComponentFixture<ParkingSlotEditForm>;

  const mockFacade = {
    editWarning: signal<string | null>(null),
    form: {
      hasCharger: signal(false),
      isAccessible: signal(false),
      isActive: signal(true),
      number: signal("A-001"),
      prefix: signal("A"),
      status: signal("AVAILABLE"),
      type: signal("CAR"),
      zone: signal("Norte"),
    },
    isNumberLocked: signal(false),
    isTypeLocked: signal(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingSlotEditForm],
    })
      .overrideComponent(ParkingSlotEditForm, {
        set: {
          providers: [{ provide: ParkingSlotFormFacade, useValue: mockFacade }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ParkingSlotEditForm);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
