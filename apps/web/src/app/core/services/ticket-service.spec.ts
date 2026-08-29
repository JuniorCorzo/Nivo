import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TicketService } from './ticket-service';
import { ParkingTicketsService, RatesService } from '@core/api/generated/services';
import {
  CreateTicketPayload,
  CheckOutPayload,
} from '@core/models/ticket.model';
import {
  ResponseParkingTicketsDto,
  ResponsePaymentsDto,
  ResponsePriceDetailed,
} from '@core/api/generated/models';

describe('TicketService', () => {
  let service: TicketService;
  let parkingTicketsSpy: jasmine.SpyObj<ParkingTicketsService>;
  let ratesSpy: jasmine.SpyObj<RatesService>;

  beforeEach(() => {
    parkingTicketsSpy = jasmine.createSpyObj('ParkingTicketsService', [
      'createTicket',
      'getActiveTicket',
      'checkOutVehicle',
    ]);
    ratesSpy = jasmine.createSpyObj('RatesService', ['calculatePrice']);

    TestBed.configureTestingModule({
      providers: [
        TicketService,
        { provide: ParkingTicketsService, useValue: parkingTicketsSpy },
        { provide: RatesService, useValue: ratesSpy },
      ],
    });

    service = TestBed.inject(TicketService);
  });

  it('should call ParkingTicketsService.createTicket and return mapped TicketSummary', (done) => {
    const mockResponse: ResponseParkingTicketsDto = {
      message: 'Created',
      status: '201',
      timestamp: '2026-08-27T10:00:00Z',
      data: {
        id: 'ticket-1',
        licensePlate: 'ABC123',
        status: 'OPEN',
        entryTime: '2026-08-27T10:00:00Z',
        user: {
          id: 'u-1',
          fullName: 'Operator',
          email: 'op@test.com',
          contactInfo: '123',
          role: 'OPERATOR',
        },
      },
    };

    parkingTicketsSpy.createTicket.and.returnValue(of(mockResponse));

    const payload: CreateTicketPayload = {
      slotId: 'slot-1',
      rateId: 'rate-1',
      plate: 'ABC123',
    };

    service.createTicket(payload).subscribe((result) => {
      expect(result.id).toBe('ticket-1');
      expect(result.licensePlate).toBe('ABC123');
      expect(service.activeTickets().length).toBe(1);
      done();
    });
  });

  it('should call RatesService.calculatePrice and return mapped PriceDetailedModel', (done) => {
    const mockResponse: ResponsePriceDetailed = {
      message: 'OK',
      status: '200',
      timestamp: '2026-08-27T10:00:00Z',
      data: {
        name: 'Tarifa General',
        subtotal: 5000,
        ivaRate: 19,
        ivaAmount: 950,
        total: 5950,
        breakpoint: [],
      },
    };

    ratesSpy.calculatePrice.and.returnValue(of(mockResponse));

    service.calculatePrice('ticket-1').subscribe((result) => {
      expect(result.total).toBe(5950);
      expect(result.name).toBe('Tarifa General');
      done();
    });
  });

  it('should call ParkingTicketsService.checkOutVehicle and return mapped PaymentRecord', (done) => {
    const mockResponse: ResponsePaymentsDto = {
      message: 'Paid',
      status: '201',
      timestamp: '2026-08-27T10:00:00Z',
      data: {
        id: 'payment-1',
        amount: 5950,
        paymentMethod: 'EFFECTIVE',
        status: 'PAID',
      },
    };

    parkingTicketsSpy.checkOutVehicle.and.returnValue(of(mockResponse));

    const payload: CheckOutPayload = {
      ticketId: 'ticket-1',
      sendVia: 'URL',
      paymentMethod: 'EFFECTIVE',
    };

    service.checkOutVehicle(payload).subscribe((result) => {
      expect(result.id).toBe('payment-1');
      expect(result.amount).toBe(5950);
      done();
    });
  });

  it('should call ParkingTicketsService.getActiveTicket and return mapped TicketSummary', (done) => {
    const mockResponse: ResponseParkingTicketsDto = {
      message: 'Found',
      status: '200',
      timestamp: '2026-08-27T10:00:00Z',
      data: {
        id: 'ticket-real-123',
        licensePlate: 'XYZ789',
        status: 'OPEN',
        entryTime: '2026-08-27T10:00:00Z',
        user: {
          id: 'u-1',
          fullName: 'Operator',
          email: 'op@test.com',
          contactInfo: '123',
          role: 'OPERATOR',
        },
        slot: {
          id: 'slot-1',
          slotNumber: '101',
          type: 'CAR',
          status: 'OCCUPIED',
        },
      },
    };

    parkingTicketsSpy.getActiveTicket.and.returnValue(of(mockResponse));

    service.getActiveTicketBySlot('slot-1').subscribe((result) => {
      expect(parkingTicketsSpy.getActiveTicket).toHaveBeenCalledWith(
        { slot: 'slot-1' },
        jasmine.any(Object),
      );
      expect(result.id).toBe('ticket-real-123');
      expect(result.licensePlate).toBe('XYZ789');
      expect(result.slotId).toBe('slot-1');
      done();
    });
  });
});
