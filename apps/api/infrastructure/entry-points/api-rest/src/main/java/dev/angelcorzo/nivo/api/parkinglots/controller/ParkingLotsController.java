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
import dev.angelcorzo.nivo.usecase.deleteslotgroup.DeleteSlotGroupUseCase;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
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
@Tag(name = "Parking Lots", description = "Parking Lots API")
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

  @GetMapping("/list")
  @PreAuthorize("hasRole('MANAGER')")
  public Response<List<ParkingLotListItemResponse>> listParkingLots() {
    final UUID tenantId = this.getTenantId();

    final List<ParkingLotListItemResponse> parkingLots = this.listParkingLotsUseCase.listParkingLots(tenantId).stream()
        .map(parkingLotsMapper::toListItemResponse)
        .toList();

    return Response.ok(parkingLots, ParkingLotsMessages.PARKING_LOTS_LIST.format());
  }

  @GetMapping("/{parkingId}/rates")
  @PreAuthorize("hasRole('OPERATOR')")
  public Response<Iterable<RatesDTO>> showRatesByParkingId(@PathVariable UUID parkingId) {
    final List<RatesDTO> listRates = this.showRatesByParkingLotUseCase.execute(parkingId).stream()
        .map(this.ratesMapper::toDTO)
        .toList();

    return Response.ok(listRates, RateMessages.SHOW_RATES_BY_TENANT.format());
  }

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

  @DeleteMapping("/{parkingId}/slots/groups")
  @PreAuthorize("hasRole('MANAGER')")
  @Transactional
  @Parameters({
      @Parameter(name = "parkingId", in = io.swagger.v3.oas.annotations.enums.ParameterIn.PATH, required = true),
      @Parameter(name = "slotType", in = io.swagger.v3.oas.annotations.enums.ParameterIn.QUERY, required = true),
      @Parameter(name = "prefix", in = io.swagger.v3.oas.annotations.enums.ParameterIn.QUERY, required = false),
      @Parameter(name = "zone", in = io.swagger.v3.oas.annotations.enums.ParameterIn.QUERY, required = false), })
  public Response<Void> deleteSlotGroup(
      @PathVariable UUID parkingId,
      @Parameter(hidden = true) @RequestParam(value = "slotType") SlotType slotType,
      @Parameter(hidden = true) @RequestParam(value = "prefix", required = false) String prefix,
      @Parameter(hidden = true) @RequestParam(value = "zone", required = false) String zone) {

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
