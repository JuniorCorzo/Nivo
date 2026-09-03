import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ToastService } from '@nivo-sass/design-system';

import { CheckInModalComponent } from './check-in-modal.component';
import { TicketService } from '@core/services/ticket-service';
import { SlotService } from '@core/services/slot-service';
import { RateService } from '@core/services/rate-service';
import { ParkingService } from '@core/services/parking-service';

describe('CheckInModalComponent', () => {
  let component: CheckInModalComponent;
  let fixture: ComponentFixture<CheckInModalComponent>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;
  let slotServiceSpy: jasmine.SpyObj<SlotService>;
  let rateServiceSpy: jasmine.SpyObj<RateService>;
  let parkingServiceSpy: jasmine.SpyObj<ParkingService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    ticketServiceSpy = jasmine.createSpyObj('TicketService', ['createTicket']);
    slotServiceSpy = jasmine.createSpyObj('SlotService', ['getAllSlotSummariesByParkingId'], {
      summaries: () => ({ 'p-1': [] }),
    });
    rateServiceSpy = jasmine.createSpyObj('RateService', ['getRatesByParkingId'], {
      ratesByParking: () => ({ 'p-1': [] }),
    });
    parkingServiceSpy = jasmine.createSpyObj('ParkingService', ['getAll'], {
      parkingLots: () => [],
    });
    toastSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    slotServiceSpy.getAllSlotSummariesByParkingId.and.returnValue(of([]));
    rateServiceSpy.getRatesByParkingId.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CheckInModalComponent],
      providers: [
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: RateService, useValue: rateServiceSpy },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckInModalComponent);
    component = fixture.componentInstance;
  });

  it('should create CheckInModalComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closed event when onClose is called', () => {
    spyOn(component.closed, 'emit');
    component.onClose();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should update plate in facade on input event', () => {
    const input = document.createElement('input');
    input.value = 'abc999';
    component.onPlateInput({ target: input } as any);
    expect(component.facade.plate()).toBe('ABC999');
  });
});
