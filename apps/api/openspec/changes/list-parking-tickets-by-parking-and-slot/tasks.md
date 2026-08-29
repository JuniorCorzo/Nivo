## 1. Domain Layer

- [x] 1.1 Extend `ParkingTicketsRepository` gateway with `findAllByParkingLotId` and `findActiveBySlotId`
- [x] 1.2 Create `ListParkingTicketsByParkingLotUseCase`
- [x] 1.3 Create `GetActiveParkingTicketBySlotUseCase`
- [x] 1.4 Write unit tests `ListParkingTicketsByParkingLotUseCaseTest`
- [x] 1.5 Write unit tests `GetActiveParkingTicketBySlotUseCaseTest`

## 2. JPA Driven Adapter Layer

- [x] 2.1 Add `findAllBySlot_Parking_Id` and `@Query findActiveBySlotId` to `ParkingTicketsRepositoryData`
- [x] 2.2 Implement `findAllByParkingLotId` and `findActiveBySlotId` in `ParkingTicketsAdapter`
- [x] 2.3 Add unit tests to `ParkingTicketsAdapterTest` for the new methods

## 3. Entry Points (REST API) Layer

- [x] 3.1 Inject use cases into `ParkingTicketsController`
- [x] 3.2 Add `GET /tickets/list` endpoint with `@PreAuthorize("hasRole('OPERATOR')")` and OpenAPI docs
- [x] 3.3 Add `GET /tickets/active` endpoint with `@PreAuthorize("hasRole('OPERATOR')")` and OpenAPI docs
- [x] 3.4 Add WebMvc unit tests for both endpoints in `ParkingTicketsControllerTest`

## 4. Verification

- [x] 4.1 Run full Gradle build and test suite `./gradlew test`
