const parkingLotsSegment = 'parking-lots';

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
  },
} as const;
