package dev.angelcorzo.nivo.api.parkinglots.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.parkinglots.dto.ParkingLotListItemResponse;
import dev.angelcorzo.nivo.api.parkinglots.dto.ParkingLotsResponse;
import dev.angelcorzo.nivo.api.parkinglots.dto.UpsertParkingLotsRequest;
import dev.angelcorzo.nivo.api.parkinglots.enums.ParkingLotsMessages;
import dev.angelcorzo.nivo.api.parkinglots.mappers.ParkingLotsMapper;
import dev.angelcorzo.nivo.api.rates.dto.CreateRate;
import dev.angelcorzo.nivo.api.rates.dto.RatesDTO;
import dev.angelcorzo.nivo.api.rates.enums.RateMessages;
import dev.angelcorzo.nivo.api.rates.mappers.RatesMapper;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.dto.UpsertParkingLotsDTO;
import dev.angelcorzo.nivo.model.rates.Rates;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.usecase.createparking.CreateParkingUseCase;
import dev.angelcorzo.nivo.usecase.listparkinglots.ListParkingLotsUseCase;
import dev.angelcorzo.nivo.usecase.rateconfiguration.RateConfigurationUseCase;
import dev.angelcorzo.nivo.usecase.showratesbyparkinglot.ShowRatesByParkingLotUseCase;
import dev.angelcorzo.nivo.usecase.updateparking.UpdateParkingLotsUseCase;
import dev.angelcorzo.nivo.usecase.deleteparkinglot.DeleteParkingLotUseCase;
import dev.angelcorzo.nivo.usecase.deleteslotgroup.DeleteSlotGroupUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/parking-lots")
@Tag(name = "Parking Lots", description = "Parking lots configuration, rates and slot groups")
@RequiredArgsConstructor
public class ParkingLotsController {
  private final AuthenticationContextGateway authenticationContext;
  private final ParkingLotsMapper parkingLotsMapper;
  private final RatesMapper ratesMapper;

  private final CreateParkingUseCase createParkingUseCase;
  private final UpdateParkingLotsUseCase updateParkingLotsUseCase;
  private final ListParkingLotsUseCase listParkingLotsUseCase;
  private final RateConfigurationUseCase rateConfigurationUseCase;
  private final ShowRatesByParkingLotUseCase showRatesByParkingLotUseCase;
  private final DeleteSlotGroupUseCase deleteSlotGroupUseCase;
  private final DeleteParkingLotUseCase deleteParkingLotUseCase;

  @Operation(
      summary = "List parking lots",
      description = "Retrieves all parking lots belonging to the current tenant")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Parking lots list retrieved"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required")
  })
  @GetMapping("/list")
  @PreAuthorize("hasRole('MANAGER')")
  public Response<List<ParkingLotListItemResponse>> listParkingLots() {
    final UUID tenantId = this.getTenantId();

    final List<ParkingLotListItemResponse> parkingLots = this.listParkingLotsUseCase.listParkingLots(tenantId).stream()
        .map(parkingLotsMapper::toListItemResponse)
        .toList();

    return Response.ok(parkingLots, ParkingLotsMessages.PARKING_LOTS_LIST.format());
  }

  @Operation(
      summary = "Show rates by parking lot",
      description = "Retrieves all configured tariff rates for a given parking lot")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Rates retrieved successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Operator role required")
  })
  @GetMapping("/{parkingId}/rates")
  @PreAuthorize("hasRole('OPERATOR')")
  public Response<Iterable<RatesDTO>> showRatesByParkingId(
      @Parameter(description = "Parking lot ID", required = true) @PathVariable UUID parkingId) {
    final List<RatesDTO> listRates = this.showRatesByParkingLotUseCase.execute(parkingId).stream()
        .map(this.ratesMapper::toDTO)
        .toList();

    return Response.ok(listRates, RateMessages.SHOW_RATES_BY_TENANT.format());
  }

  @Operation(
      summary = "Create parking lot",
      description = "Creates a new parking lot with operating hours, slots, address, and coordinates")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Parking lot created successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid payload"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required")
  })
  @PostMapping("/create")
  @PreAuthorize("hasRole('MANAGER')")
  @Transactional
  public Response<ParkingLotsResponse> createParkingLots(
      @Valid @RequestBody UpsertParkingLotsRequest parkingLots) {

    final UpsertParkingLotsDTO newParkingLots = this.parkingLotsMapper.toModel(parkingLots);

    final ParkingLots parkingLotsCreated = this.createParkingUseCase.execute(newParkingLots);

    return Response.ok(
        this.parkingLotsMapper.toDTO(parkingLotsCreated),
        ParkingLotsMessages.PARKING_LOT_CREATED.format());
  }

  @Operation(
      summary = "Configure tariff rate for parking lot",
      description = "Creates a new tariff rate associated with a parking lot")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Rate configured successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid rate payload"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Owner role required")
  })
  @PostMapping("/create-rate")
  @PreAuthorize("hasRole('OWNER')")
  @Transactional
  public Response<RatesDTO> createRateForParking(@Valid @RequestBody CreateRate rate) {
    final RateConfigurationUseCase.CreateTariff rateModel = this.ratesMapper.toModel(rate).toBuilder()
        .tenantId(this.getTenantId()).build();

    final Rates rateCreated = this.rateConfigurationUseCase.execute(rateModel);

    return Response.created(
        this.ratesMapper.toDTO(rateCreated), RateMessages.RATE_CONFIGURATED_SUCCESSFULLY.format());
  }

  @Operation(
      summary = "Update parking lot",
      description = "Updates an existing parking lot's details, hours, and configuration")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Parking lot updated successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid payload"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required")
  })
  @PutMapping("/update")
  @PreAuthorize("hasRole('MANAGER')")
  @Transactional
  public Response<ParkingLotsResponse> updateParkingLots(
      @Valid @RequestBody UpsertParkingLotsRequest parkingLots) {
    final UpsertParkingLotsDTO updateParkingLots = this.parkingLotsMapper.toModel(parkingLots);

    return Response.ok(
        this.parkingLotsMapper.toDTO(this.updateParkingLotsUseCase.update(updateParkingLots)),
        ParkingLotsMessages.PARKING_LOTS_UPDATED.format());
  }

  @Operation(
      summary = "Delete parking lot",
      description = "Deletes a parking lot by its ID")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Parking lot deleted successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required"),
    @ApiResponse(responseCode = "404", description = "Parking lot not found")
  })
  @DeleteMapping("/{parkingId}")
  @PreAuthorize("hasRole('MANAGER')")
  @Transactional
  public Response<Void> deleteParkingLot(
      @Parameter(description = "Parking lot ID", required = true) @PathVariable UUID parkingId) {
    this.deleteParkingLotUseCase.execute(parkingId);
    return Response.ok(null, ParkingLotsMessages.PARKING_LOT_DELETED.format());
  }

  @Operation(
      summary = "Delete slot group",
      description = "Deletes a group of slots from a parking lot by slot type, prefix, and zone")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Slot group deleted successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required")
  })
  @DeleteMapping("/{parkingId}/slots/groups")
  @PreAuthorize("hasRole('MANAGER')")
  @Transactional
  public Response<Void> deleteSlotGroup(
      @Parameter(description = "Parking lot ID", required = true) @PathVariable UUID parkingId,
      @Parameter(description = "Slot type (e.g. STANDARD, COMPACT)", required = true) @RequestParam(value = "slotType") SlotType slotType,
      @Parameter(description = "Prefix filter", required = false) @RequestParam(value = "prefix", required = false) String prefix,
      @Parameter(description = "Zone filter", required = false) @RequestParam(value = "zone", required = false) String zone) {

    this.deleteSlotGroupUseCase.execute(
        DeleteSlotGroupUseCase.DeleteSlotGroupCommand.builder()
            .parkingId(parkingId)
            .slotType(slotType)
            .prefix(prefix)
            .zone(zone)
            .build());

    return Response.ok(null, ParkingLotsMessages.SLOT_GROUP_DELETED.format());
  }

  private UUID getTenantId() {
    return this.authenticationContext.getCurrentTenantId();
  }
}
