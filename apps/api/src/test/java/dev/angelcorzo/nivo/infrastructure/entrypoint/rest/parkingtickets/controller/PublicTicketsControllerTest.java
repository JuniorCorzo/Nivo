package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.PlateCountry;
import dev.angelcorzo.nivo.domain.model.parkingtickets.valueobjects.SlotSnapshot;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.domain.usecase.ticket.GetPublicTicketUseCase;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.exception.ExceptionHandlerController;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.dto.PublicTicketDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.mapper.ParkingTicketMapper;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto.RatesInfo;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@WebMvcTest(PublicTicketsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {PublicTicketsController.class, ExceptionHandlerController.class})
@ExtendWith(MockitoExtension.class)
@DisplayName("PublicTicketsController Unit Tests")
class PublicTicketsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GetPublicTicketUseCase getPublicTicketUseCase;

    @MockitoBean
    private ParkingTicketMapper parkingTicketMapper;

    @Test
    @DisplayName("GET /public/tickets/{id} - Should return 200 OK with PublicTicketDTO including unplated motorcycle details")
    void shouldReturn200WithPublicTicketDto() throws Exception {
        final UUID ticketId = UUID.randomUUID();
        final UUID slotId = UUID.randomUUID();
        final UUID rateId = UUID.randomUUID();
        final String photoUrl = "https://storage.nivo.dev/photos/unplated-bike.jpg";
        final ZonedDateTime entryTime = ZonedDateTime.now(ZoneId.of("America/Bogota"));

        final SlotSnapshot slotSnapshot = SlotSnapshot.builder().id(slotId).slotNumber("M-01").zone("ZONE-MOTO")
            .prefix("M").type(SlotType.MOTORCYCLE).hasCharger(false).isAccessible(false).build();

        final RatesInfo ratesInfo = RatesInfo.builder().id(rateId).name("Tarifa Moto")
            .description("Tarifa estandar para motos").pricePerUnit(new BigDecimal("1500.00"))
            .timeUnit(TimeUnitsRate.HOURS).minChargeTimeMinutes(30).vehicleType(VehicleType.MOTORCYCLE).build();

        final ParkingTickets domainTicket = ParkingTickets.builder().id(ticketId).licensePlate("SP-1042")
            .plateCountry(PlateCountry.UNPLATED).photoUrl(photoUrl).status(ParkingTicketStatus.OPEN).build();

        final PublicTicketDTO responseDto = PublicTicketDTO.builder().id(ticketId).licensePlate("SP-1042")
            .plateCountry(PlateCountry.UNPLATED).photoUrl(photoUrl).entryTime(entryTime)
            .status(ParkingTicketStatus.OPEN).slotSnapshot(slotSnapshot).rate(ratesInfo)
            .totalToCharge(new BigDecimal("1500.00")).build();

        when(getPublicTicketUseCase.execute(ticketId)).thenReturn(domainTicket);
        when(parkingTicketMapper.toPublicDto(domainTicket)).thenReturn(responseDto);

        mockMvc.perform(get("/public/tickets/{id}", ticketId).contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("200 OK"))
            .andExpect(jsonPath("$.data.id").value(ticketId.toString()))
            .andExpect(jsonPath("$.data.licensePlate").value("SP-1042"))
            .andExpect(jsonPath("$.data.plateCountry").value("UNPLATED"))
            .andExpect(jsonPath("$.data.photoUrl").value(photoUrl)).andExpect(jsonPath("$.data.status").value("OPEN"))
            .andExpect(jsonPath("$.data.slotSnapshot.id").value(slotId.toString()))
            .andExpect(jsonPath("$.data.slotSnapshot.slotNumber").value("M-01"))
            .andExpect(jsonPath("$.data.slotSnapshot.type").value("MOTORCYCLE"))
            .andExpect(jsonPath("$.data.rate.id").value(rateId.toString()))
            .andExpect(jsonPath("$.data.rate.name").value("Tarifa Moto"))
            .andExpect(jsonPath("$.data.totalToCharge").value(1500.00))
            .andExpect(jsonPath("$.message").value("Public ticket retrieved successfully"));

        verify(getPublicTicketUseCase).execute(ticketId);
        verify(parkingTicketMapper).toPublicDto(domainTicket);
    }

    @Test
    @DisplayName("GET /public/tickets/{id} - Should return 404 Not Found when ticket does not exist")
    void shouldReturn404WhenTicketDoesNotExist() throws Exception {
        final UUID ticketId = UUID.randomUUID();

        when(getPublicTicketUseCase.execute(ticketId)).thenThrow(new ParkingTicketNotFound(ticketId));

        mockMvc.perform(get("/public/tickets/{id}", ticketId).contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("PARKING_TICKET_NOT_FOUND"));

        verify(getPublicTicketUseCase).execute(ticketId);
    }
}
