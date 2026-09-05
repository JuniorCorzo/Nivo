import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ParkingService } from "@core/services/parking-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";

import { CheckOutModalComponent } from "./check-out-modal.component";

describe("CheckOutModalComponent", () => {
  let component: CheckOutModalComponent;
  let fixture: ComponentFixture<CheckOutModalComponent>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;
  let slotServiceSpy: jasmine.SpyObj<SlotService>;
  let parkingServiceSpy: jasmine.SpyObj<ParkingService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    ticketServiceSpy = jasmine.createSpyObj("TicketService", [
      "calculatePrice",
      "checkOutVehicle",
    ]);
    slotServiceSpy = jasmine.createSpyObj("SlotService", [
      "getAllSlotSummariesByParkingId",
    ]);
    parkingServiceSpy = jasmine.createSpyObj("ParkingService", ["getAll"], {
      parkingLots: () => [],
    });
    toastSpy = jasmine.createSpyObj("ToastService", ["showToast"]);

    slotServiceSpy.getAllSlotSummariesByParkingId.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CheckOutModalComponent],
      providers: [
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckOutModalComponent);
    component = fixture.componentInstance;
  });

  it("should create CheckOutModalComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should emit closed when onClose is called", () => {
    spyOn(component.closed, "emit");
    component.onClose();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it("should delegate confirm checkout to facade", () => {
    spyOn(component.facade, "confirmCheckOut");
    component.onConfirmCheckOut();
    expect(component.facade.confirmCheckOut).toHaveBeenCalled();
  });
});
