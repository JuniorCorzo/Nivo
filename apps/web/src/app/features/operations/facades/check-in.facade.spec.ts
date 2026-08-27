import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToastService } from '@nivo-sass/design-system';

import { CheckInFacade } from './check-in.facade';
import { TicketService } from '@core/services/ticket-service';
import { SlotService } from '@core/services/slot-service';
import { RateService } from '@core/services/rate-service';
import { ParkingService } from '@core/services/parking-service';
import { TicketSummary } from '@core/models/ticket.model';

describe('CheckInFacade', () => {
  let facade: CheckInFacade;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;
  let slotServiceSpy: jasmine.SpyObj<SlotService>;
  let rateServiceSpy: jasmine.SpyObj<RateService>;
  let parkingServiceSpy: jasmine.SpyObj<ParkingService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    ticketServiceSpy = jasmine.createSpyObj('TicketService', ['createTicket']);
    slotServiceSpy = jasmine.createSpyObj('SlotService', ['getAllSlotSummariesByParkingId'], {
      summaries: () => ({
        'parking-1': [
          {
            id: 'slot-1',
            parkingName: 'Central',
            slotNumber: '101',
            prefix: 'A',
            zone: 'Z1',
            type: 'CAR',
            status: 'AVAILABLE',
          },
        ],
      }),
    });
    rateServiceSpy = jasmine.createSpyObj('RateService', ['getRatesByParkingId'], {
      ratesByParking: () => ({
        'parking-1': [
          {
            id: 'rate-1',
            name: 'Tarifa Carros',
            description: 'Hora',
            vehicleType: 'CAR',
            timeUnit: 'HOURS',
            pricePerUnit: 4000,
            minChargeTimeMinutes: 15,
            parkingId: 'parking-1',
            createdAt: '',
            updatedAt: '',
          },
        ],
      }),
    });
    parkingServiceSpy = jasmine.createSpyObj('ParkingService', ['getAll'], {
      parkingLots: () => [{ id: 'parking-1', name: 'Central' } as any],
    });
    toastSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    slotServiceSpy.getAllSlotSummariesByParkingId.and.returnValue(of([]));
    rateServiceSpy.getRatesByParkingId.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        CheckInFacade,
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: RateService, useValue: rateServiceSpy },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    facade = TestBed.inject(CheckInFacade);
  });

  it('should initialize and load slots and rates for parking lot', () => {
    facade.init('parking-1');

    expect(facade.parkingId()).toBe('parking-1');
    expect(slotServiceSpy.getAllSlotSummariesByParkingId).toHaveBeenCalledWith('parking-1');
    expect(rateServiceSpy.getRatesByParkingId).toHaveBeenCalledWith('parking-1');
  });

  it('should normalize license plate to uppercase and trimmed', () => {
    facade.setPlate('  xyz456  ');
    expect(facade.plate()).toBe('XYZ456');
  });

  it('should auto-select slot and rate on vehicle type change', () => {
    facade.init('parking-1');
    facade.setVehicleType('CAR');

    expect(facade.selectedSlotId()).toBe('slot-1');
    expect(facade.selectedRateId()).toBe('rate-1');
    expect(facade.hasAvailableSlots()).toBe(true);
  });

  it('should validate form correctly based on plate, slot, rate selection', () => {
    facade.init('parking-1');
    facade.setVehicleType('CAR');
    facade.setPlate('AB');
    expect(facade.isValid()).toBe(false);

    facade.setPlate('ABC-123');
    expect(facade.isValid()).toBe(true);
  });

  it('should submit check-in, set issued ticket and open receipt on success', () => {
    const mockTicket: TicketSummary = {
      id: 'ticket-new',
      licensePlate: 'ABC123',
      status: 'OPEN',
      entryTime: '2026-08-27T10:00:00Z',
    };
    ticketServiceSpy.createTicket.and.returnValue(of(mockTicket));

    facade.init('parking-1');
    facade.setVehicleType('CAR');
    facade.setPlate('ABC123');
    facade.setEmail('test@email.com');

    facade.submitCheckIn();

    expect(ticketServiceSpy.createTicket).toHaveBeenCalledWith({
      slotId: 'slot-1',
      rateId: 'rate-1',
      plate: 'ABC123',
      email: 'test@email.com',
    });
    expect(facade.lastIssuedTicket()).toEqual(mockTicket);
    expect(facade.isReceiptOpen()).toBe(true);
    expect(facade.plate()).toBe('');
  });

  it('should handle conflict / duplicate plate error and set error message', () => {
    ticketServiceSpy.createTicket.and.returnValue(
      throwError(() => ({
        error: { message: 'Vehículo ya tiene un ticket activo' },
      })),
    );

    facade.init('parking-1');
    facade.setVehicleType('CAR');
    facade.setPlate('ABC123');

    facade.submitCheckIn();

    expect(facade.errorMessage()).toBe('Vehículo ya tiene un ticket activo');
    expect(toastSpy.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: 'error' }),
    );
  });
});
