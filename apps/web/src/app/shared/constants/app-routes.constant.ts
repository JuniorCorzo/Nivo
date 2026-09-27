const parkingLotsSegment = "parking-lots";
const slotsSegment = "slots";
const ratesSegment = "rates";
const operationsSegment = "operations";
const ticketsSegment = "tickets";

export const APP_ROUTE_PATHS = {
  app: {
    createParkingLotRate: `${parkingLotsSegment}/:parkingId/${ratesSegment}/new`,
    createParkingLotSlot: `${parkingLotsSegment}/:parkingId/${slotsSegment}/new`,
    createParkingLots: `${parkingLotsSegment}/create`,
    editParkingLotRate: `${parkingLotsSegment}/:parkingId/${ratesSegment}/:rateId/edit`,
    editParkingLotSlot: `${parkingLotsSegment}/:parkingId/${slotsSegment}/:slotId/edit`,
    editParkingLots: `${parkingLotsSegment}/:parkingId/edit`,
    parkingLotOperations: `${parkingLotsSegment}/:parkingId/${operationsSegment}`,
    parkingLotRates: `${parkingLotsSegment}/:parkingId/${ratesSegment}`,
    parkingLotSlotDetail: `${parkingLotsSegment}/:parkingId/${slotsSegment}/:slotId`,
    parkingLotSlots: `${parkingLotsSegment}/:parkingId/${slotsSegment}`,
    parkingLotTickets: `${parkingLotsSegment}/:parkingId/${ticketsSegment}`,
    dashboard: "dashboard",
    parkingLots: parkingLotsSegment,
    tickets: ticketsSegment,
  },
  auth: {
    login: "login",
    register: "register",
  },
} as const;

const parkingLotsRoute = `/app/${parkingLotsSegment}`;
export const APP_ROUTES = {
  app: {
    createParkingLotRate: (parkingId: string) =>
      `${parkingLotsRoute}/${parkingId}/${ratesSegment}/new`,
    createParkingLotSlot: (parkingId: string) =>
      `${parkingLotsRoute}/${parkingId}/${slotsSegment}/new`,
    createParkingLots: `${parkingLotsRoute}/create`,
    editParkingLotRate: (parkingId: string, rateId: string) =>
      `${parkingLotsRoute}/${parkingId}/${ratesSegment}/${rateId}/edit`,
    editParkingLotSlot: (parkingId: string, slotId: string) =>
      `${parkingLotsRoute}/${parkingId}/${slotsSegment}/${slotId}/edit`,
    editParkingLots: (parkingId: string) =>
      `${parkingLotsRoute}/${parkingId}/edit`,
    parkingLotOperations: (parkingId: string) =>
      `${parkingLotsRoute}/${parkingId}/${operationsSegment}`,
    parkingLotRates: (parkingId: string) =>
      `${parkingLotsRoute}/${parkingId}/${ratesSegment}`,
    parkingLotSlotDetail: (parkingId: string, slotId: string) =>
      `${parkingLotsRoute}/${parkingId}/${slotsSegment}/${slotId}`,
    parkingLotSlots: (parkingId: string) =>
      `${parkingLotsRoute}/${parkingId}/${slotsSegment}`,
    parkingLotTickets: (parkingId: string) =>
      `${parkingLotsRoute}/${parkingId}/${ticketsSegment}`,
    dashboard: "/app/dashboard",
    parkingLots: parkingLotsRoute,
    tickets: `/app/${ticketsSegment}`,
  },
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
} as const;
