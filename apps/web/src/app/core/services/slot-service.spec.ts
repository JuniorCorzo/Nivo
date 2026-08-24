import { mapToSlotSummary } from './slot-service';
import { SlotSummaryResponse } from '@core/api/generated/models';

describe('mapToSlotSummary', () => {
  it('should map hasTicket and hasHistory when true', () => {
    const api: SlotSummaryResponse = {
      id: 'abc',
      parkingName: 'Test',
      numberSlot: '001',
      prefix: 'P',
      zone: 'A',
      type: 'CAR',
      status: 'OCCUPIED',
      hasTicket: true,
      hasHistory: true,
    };

    const result = mapToSlotSummary(api);

    expect(result.hasTicket).toBe(true);
    expect(result.hasHistory).toBe(true);
    expect(result.status).toBe('OCCUPIED');
  });

  it('should map hasTicket and hasHistory when false', () => {
    const api: SlotSummaryResponse = {
      id: 'abc',
      parkingName: 'Test',
      numberSlot: '002',
      prefix: 'Q',
      zone: 'B',
      type: 'MOTORCYCLE',
      status: 'AVAILABLE',
      hasTicket: false,
      hasHistory: false,
    };

    const result = mapToSlotSummary(api);

    expect(result.hasTicket).toBe(false);
    expect(result.hasHistory).toBe(false);
    expect(result.status).toBe('AVAILABLE');
  });

  it('should default hasTicket/hasHistory to false when undefined', () => {
    const api: SlotSummaryResponse = {
      id: 'abc',
      parkingName: 'Test',
      numberSlot: '003',
      prefix: 'R',
      zone: 'C',
      type: 'BIKE',
      status: 'MAINTENANCE',
    };

    const result = mapToSlotSummary(api);

    expect(result.hasTicket).toBe(false);
    expect(result.hasHistory).toBe(false);
    expect(result.status).toBe('MAINTENANCE');
  });
});
