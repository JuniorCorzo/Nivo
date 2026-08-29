import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToastService } from '@nivo-sass/design-system';

import { OperationsPageComponent } from './operations-page';
import { ParkingService } from '@core/services/parking-service';
import { SlotService } from '@core/services/slot-service';
import { RateService } from '@core/services/rate-service';
import { TicketService } from '@core/services/ticket-service';

describe('OperationsPageComponent', () => {
  let component: OperationsPageComponent;
  let fixture: ComponentFixture<OperationsPageComponent>;
  let parkingServiceSpy: jasmine.SpyObj<ParkingService>;
  let slotServiceSpy: jasmine.SpyObj<SlotService>;
  let rateServiceSpy: jasmine.SpyObj<RateService>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    parkingServiceSpy = jasmine.createSpyObj('ParkingService', ['getAll'], {
      parkingLots: () => [
        {
          id: 'p-1',
          name: 'Parqueadero Central',
          currency: 'COP',
        } as any,
      ],
    });

    slotServiceSpy = jasmine.createSpyObj('SlotService', ['getAllSlotSummariesByParkingId'], {
      summaries: () => ({
        'p-1': [
          {
            id: 's-1',
            parkingName: 'Central',
            slotNumber: '101',
            prefix: 'A',
            zone: 'Z1',
            type: 'CAR',
            status: 'AVAILABLE',
          },
          {
            id: 's-2',
            parkingName: 'Central',
            slotNumber: '102',
            prefix: 'A',
            zone: 'Z1',
            type: 'CAR',
            status: 'OCCUPIED',
          },
        ],
      }),
    });

    rateServiceSpy = jasmine.createSpyObj('RateService', ['getRatesByParkingId'], {
      ratesByParking: () => ({
        'p-1': [
          {
            id: 'r-1',
            name: 'Tarifa Carro',
            pricePerUnit: 5000,
            timeUnit: 'HOURS',
            vehicleType: 'CAR',
          } as any,
        ],
      }),
    });

    ticketServiceSpy = jasmine.createSpyObj('TicketService', [
      'createTicket',
      'getActiveTicketBySlot',
      'calculatePrice',
      'checkOutVehicle',
    ]);
    toastSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    slotServiceSpy.getAllSlotSummariesByParkingId.and.returnValue(of([]));
    rateServiceSpy.getRatesByParkingId.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [OperationsPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ parkingId: 'p-1' })),
          },
        },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: RateService, useValue: rateServiceSpy },
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create OperationsPageComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should compute metrics accurately for slots and occupation', () => {
    expect(component.totalSlotsCount()).toBe(2);
    expect(component.availableSlotsCount()).toBe(1);
    expect(component.occupiedSlotsCount()).toBe(1);
    expect(component.occupationPercentage()).toBe(50);
  });

  it('should toggle check-in modal state', () => {
    expect(component.isCheckInModalOpen()).toBe(false);
    component.openCheckInModal();
    expect(component.isCheckInModalOpen()).toBe(true);
    component.closeCheckInModal();
    expect(component.isCheckInModalOpen()).toBe(false);
  });

  it('should toggle check-out modal state', () => {
    expect(component.isCheckOutModalOpen()).toBe(false);
    component.openDirectCheckOutModal();
    expect(component.isCheckOutModalOpen()).toBe(true);
    component.closeCheckOutModal();
    expect(component.isCheckOutModalOpen()).toBe(false);
  });

  it('should filter slots by vehicle type and status', () => {
    component.setVehicleFilter('CAR');
    expect(component.filteredSlots().length).toBe(2);

    component.setStatusFilter('AVAILABLE');
    expect(component.filteredSlots().length).toBe(1);
    expect(component.filteredSlots()[0].id).toBe('s-1');
  });

  it('should fetch active ticket for occupied slot and open checkout modal on checkOutSpecificSlot', () => {
    const mockSlot = {
      id: 's-2',
      parkingName: 'Central',
      slotNumber: '102',
      prefix: 'A',
      zone: 'Z1',
      type: 'CAR' as const,
      status: 'OCCUPIED' as const,
    };
    const mockTicket = {
      id: 'ticket-999',
      licensePlate: 'ABC123',
      slotId: 's-2',
      slotNumber: '102',
      entryTime: '2026-08-28T12:00:00Z',
      status: 'OPEN' as const,
    };

    ticketServiceSpy.getActiveTicketBySlot.and.returnValue(of(mockTicket));

    component.checkOutSpecificSlot(mockSlot);

    expect(ticketServiceSpy.getActiveTicketBySlot).toHaveBeenCalledWith('s-2');
    expect(component.selectedCheckoutTicket()).toEqual(mockTicket);
    expect(component.isCheckOutModalOpen()).toBe(true);
  });

  it('should show error toast when active ticket lookup fails on checkOutSpecificSlot', () => {
    const mockSlot = {
      id: 's-2',
      parkingName: 'Central',
      slotNumber: '102',
      prefix: 'A',
      zone: 'Z1',
      type: 'CAR' as const,
      status: 'OCCUPIED' as const,
    };

    ticketServiceSpy.getActiveTicketBySlot.and.returnValue(
      throwError(() => ({ error: { message: 'Ticket no encontrado' } })),
    );

    component.checkOutSpecificSlot(mockSlot);

    expect(ticketServiceSpy.getActiveTicketBySlot).toHaveBeenCalledWith('s-2');
    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: 'Ticket no encontrado',
      type: 'error',
    });
    expect(component.isCheckOutModalOpen()).toBe(false);
  });

  it('should fallback to default error message if error payload has no message', () => {
    const mockSlot = {
      id: 's-2',
      parkingName: 'Central',
      slotNumber: '102',
      prefix: 'A',
      zone: 'Z1',
      type: 'CAR' as const,
      status: 'OCCUPIED' as const,
    };

    ticketServiceSpy.getActiveTicketBySlot.and.returnValue(
      throwError(() => new Error('Unknown')),
    );

    component.checkOutSpecificSlot(mockSlot);

    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: 'No se encontró un ticket activo para este cupo.',
      type: 'error',
    });
  });
});
