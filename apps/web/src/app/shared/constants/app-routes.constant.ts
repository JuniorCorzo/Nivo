const parkingLotsSegment = 'parking-lots';
const slotsSegment = 'slots';
const ratesSegment = 'rates';

export const APP_ROUTE_PATHS = {
  auth: {
    login: 'login',
    register: 'register',
  },
  app: {
    parkingLots: parkingLotsSegment,
    parkingLotDetail: `${parkingLotsSegment}/:parkingId`,
    createParkingLots: `${parkingLotsSegment}/create`,
    editParkingLots: `${parkingLotsSegment}/:parkingId/edit`,
    parkingLotSlots: `${parkingLotsSegment}/:parkingId/${slotsSegment}`,
    parkingLotSlotDetail: `${parkingLotsSegment}/:parkingId/${slotsSegment}/:slotId`,
    createParkingLotSlot: `${parkingLotsSegment}/:parkingId/${slotsSegment}/new`,
    editParkingLotSlot: `${parkingLotsSegment}/:parkingId/${slotsSegment}/:slotId/edit`,
    parkingLotRates: `${parkingLotsSegment}/:parkingId/${ratesSegment}`,
    createParkingLotRate: `${parkingLotsSegment}/:parkingId/${ratesSegment}/new`,
    editParkingLotRate: `${parkingLotsSegment}/:parkingId/${ratesSegment}/:rateId/edit`,
  },
} as const;

const parkingLotsRoute = `/app/${parkingLotsSegment}`;
export const APP_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  app: {
    parkingLots: parkingLotsRoute,
    parkingLotDetail: (parkingId: string) => `${parkingLotsRoute}/${parkingId}`,
    createParkingLots: `${parkingLotsRoute}/create`,
    editParkingLots: (parkingId: string) => `${parkingLotsRoute}/${parkingId}/edit`,
    parkingLotSlots: (parkingId: string) => `${parkingLotsRoute}/${parkingId}/${slotsSegment}`,
    parkingLotSlotDetail: (parkingId: string, slotId: string) =>
      `${parkingLotsRoute}/${parkingId}/${slotsSegment}/${slotId}`,
    createParkingLotSlot: (parkingId: string) =>
      `${parkingLotsRoute}/${parkingId}/${slotsSegment}/new`,
    editParkingLotSlot: (parkingId: string, slotId: string) =>
      `${parkingLotsRoute}/${parkingId}/${slotsSegment}/${slotId}/edit`,
    parkingLotRates: (parkingId: string) => `${parkingLotsRoute}/${parkingId}/${ratesSegment}`,
    createParkingLotRate: (parkingId: string) =>
      `${parkingLotsRoute}/${parkingId}/${ratesSegment}/new`,
    editParkingLotRate: (parkingId: string, rateId: string) =>
      `${parkingLotsRoute}/${parkingId}/${ratesSegment}/${rateId}/edit`,
  },
} as const;
