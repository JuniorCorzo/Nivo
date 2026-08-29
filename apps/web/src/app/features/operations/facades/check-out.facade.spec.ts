import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToastService } from '@nivo-sass/design-system';

import { CheckOutFacade } from './check-out.facade';
import { TicketService } from '@core/services/ticket-service';
import { SlotService } from '@core/services/slot-service';
import { ParkingService } from '@core/services/parking-service';
import {
  PaymentRecord,
  PriceDetailedModel,
  TicketSummary,
} from '@core/models/ticket.model';

describe('CheckOutFacade', () => {
  let facade: CheckOutFacade;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;
  let slotServiceSpy: jasmine.SpyObj<SlotService>;
  let parkingServiceSpy: jasmine.SpyObj<ParkingService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    ticketServiceSpy = jasmine.createSpyObj('TicketService', [
      'calculatePrice',
      'checkOutVehicle',
    ]);
    slotServiceSpy = jasmine.createSpyObj('SlotService', ['getAllSlotSummariesByParkingId']);
    parkingServiceSpy = jasmine.createSpyObj('ParkingService', ['getAll'], {
      parkingLots: () => [],
    });
    toastSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    slotServiceSpy.getAllSlotSummariesByParkingId.and.returnValue(of([]));
    ticketServiceSpy.calculatePrice.and.returnValue(
      of({
        name: 'Tarifa',
        subtotal: 5000,
        ivaRate: 19,
        ivaAmount: 950,
        total: 5950,
        breakdown: [],
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        CheckOutFacade,
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    facade = TestBed.inject(CheckOutFacade);
  });

  it('should calculate price preview when selecting ticket', () => {
    const mockCalculation: PriceDetailedModel = {
      name: 'Tarifa Estándar',
      subtotal: 5000,
      ivaRate: 19,
      ivaAmount: 950,
      total: 5950,
      breakdown: [],
    };
    ticketServiceSpy.calculatePrice.and.returnValue(of(mockCalculation));

    const ticket: TicketSummary = {
      id: 'ticket-1',
      licensePlate: 'ABC123',
      status: 'OPEN',
      entryTime: '2026-08-27T10:00:00Z',
    };

    facade.selectTicket(ticket);

    expect(facade.selectedTicket()).toEqual(ticket);
    expect(ticketServiceSpy.calculatePrice).toHaveBeenCalledWith('ticket-1');
    expect(facade.priceCalculation()).toEqual(mockCalculation);
    expect(facade.isZeroPayment()).toBe(false);
  });

  it('should identify zero-payment when total is 0', () => {
    const zeroCalculation: PriceDetailedModel = {
      name: 'Tarifa Gracia',
      subtotal: 0,
      ivaRate: 0,
      ivaAmount: 0,
      total: 0,
      breakdown: [],
    };
    ticketServiceSpy.calculatePrice.and.returnValue(of(zeroCalculation));

    const ticket: TicketSummary = {
      id: 'ticket-grace',
      licensePlate: 'XYZ999',
      status: 'OPEN',
      entryTime: '2026-08-27T10:00:00Z',
    };

    facade.selectTicket(ticket);

    expect(facade.isZeroPayment()).toBe(true);
  });

  it('should execute check-out and open receipt on confirmation', () => {
    const mockPayment: PaymentRecord = {
      id: 'pay-1',
      amount: 5950,
      paymentMethod: 'EFFECTIVE',
      status: 'APPROVED',
    };
    ticketServiceSpy.checkOutVehicle.and.returnValue(of(mockPayment));

    const ticket: TicketSummary = {
      id: 'ticket-1',
      licensePlate: 'ABC123',
      status: 'OPEN',
      entryTime: '2026-08-27T10:00:00Z',
    };

    facade.init('parking-1');
    facade.selectTicket(ticket);
    facade.setPaymentMethod('EFFECTIVE');
    facade.setSendVia('URL');

    facade.confirmCheckOut();

    expect(ticketServiceSpy.checkOutVehicle).toHaveBeenCalledWith({
      ticketId: 'ticket-1',
      sendVia: 'URL',
      paymentMethod: 'EFFECTIVE',
      email: undefined,
    });
    expect(facade.lastPaymentRecord()).toEqual(mockPayment);
    expect(facade.isReceiptOpen()).toBe(true);
    expect(toastSpy.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: 'success' }),
    );
  });
});
