import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketReceiptComponent } from './ticket-receipt.component';
import { TicketSummary } from '@core/models/ticket.model';

describe('TicketReceiptComponent', () => {
  let component: TicketReceiptComponent;
  let fixture: ComponentFixture<TicketReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketReceiptComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketReceiptComponent);
    component = fixture.componentInstance;
  });

  it('should create ticket receipt component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closed output when onClose is called', () => {
    spyOn(component.closed, 'emit');
    component.onClose();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2026-08-27T10:30:00.000Z');
    expect(formatted).not.toBe('---');
  });
});
