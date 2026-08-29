package dev.angelcorzo.nivo.api.parkingtickets.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.api.parkingtickets.dto.CreateTicket;
import dev.angelcorzo.nivo.api.parkingtickets.dto.ParkingTicketsDTO;
import dev.angelcorzo.nivo.api.parkingtickets.mapper.ParkingTicketMapper;
import dev.angelcorzo.nivo.api.payments.dtos.request.check_out.check_out.CheckOutCommand;
import dev.angelcorzo.nivo.api.payments.dtos.request.check_out.check_out.EmailCheckOutCommand;
import dev.angelcorzo.nivo.api.payments.dtos.response.PaymentsDTO;
import dev.angelcorzo.nivo.api.payments.mappers.PaymentsMapper;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.EmailCheckOut;
import dev.angelcorzo.nivo.usecase.checkinvehiclewithoureservation.CheckInVehicleWithoutReservationUseCase;
import dev.angelcorzo.nivo.usecase.checkoutvehicle.CheckOutVehicleUseCase;
import dev.angelcorzo.nivo.usecase.getactiveparkingticketbyslot.GetActiveParkingTicketBySlotUseCase;
import dev.angelcorzo.nivo.usecase.listparkingticketsbyparkinglot.ListParkingTicketsByParkingLotUseCase;
import java.util.List;
import java.util.Optional;
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
@WebMvcTest(ParkingTicketsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = ParkingTicketsController.class)
@ExtendWith(MockitoExtension.class)
@DisplayName("ParkingTicketsController Unit Tests")
class ParkingTicketsControllerTest {

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

  @MockitoBean private CheckInVehicleWithoutReservationUseCase checkInVehicleWithoutReservationUseCase;
  @MockitoBean private CheckOutVehicleUseCase checkOutVehicleUseCase;
  @MockitoBean private ListParkingTicketsByParkingLotUseCase listParkingTicketsByParkingLotUseCase;
  @MockitoBean private GetActiveParkingTicketBySlotUseCase getActiveParkingTicketBySlotUseCase;
  @MockitoBean private AuthenticationContextGateway authenticationContext;
  @MockitoBean private ParkingTicketMapper parkingTicketMapper;
  @MockitoBean private PaymentsMapper paymentsMapper;

  @Test
  @DisplayName("GET /tickets/list - Should list tickets by parking lot successfully")
  void shouldListTicketsByParkingLot() throws Exception {
    UUID parkingLotId = UUID.randomUUID();
    ParkingTickets ticket = ParkingTickets.builder().id(UUID.randomUUID()).build();
    ParkingTicketsDTO dto = ParkingTicketsDTO.builder().id(ticket.getId()).build();

    when(listParkingTicketsByParkingLotUseCase.execute(parkingLotId)).thenReturn(List.of(ticket));
    when(parkingTicketMapper.toDto(ticket)).thenReturn(dto);

    mockMvc
        .perform(
            get("/tickets/list")
                .param("parking", parkingLotId.toString())
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.data.length()").value(1))
        .andExpect(jsonPath("$.message").value("Tickets retrieved successfully"));
  }

  @Test
  @DisplayName("GET /tickets/active - Should get active ticket for slot successfully")
  void shouldGetActiveTicketBySlot() throws Exception {
    UUID slotId = UUID.randomUUID();
    ParkingTickets ticket = ParkingTickets.builder().id(UUID.randomUUID()).build();
    ParkingTicketsDTO dto = ParkingTicketsDTO.builder().id(ticket.getId()).build();

    when(getActiveParkingTicketBySlotUseCase.execute(slotId)).thenReturn(Optional.of(ticket));
    when(parkingTicketMapper.toDto(ticket)).thenReturn(dto);

    mockMvc
        .perform(
            get("/tickets/active")
                .param("slot", slotId.toString())
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.id").value(ticket.getId().toString()))
        .andExpect(jsonPath("$.message").value("Active ticket retrieved successfully"));
  }

  @Test
  @DisplayName("GET /tickets/active - Should return null data when slot has no active ticket")
  void shouldReturnNullWhenNoActiveTicket() throws Exception {
    UUID slotId = UUID.randomUUID();

    when(getActiveParkingTicketBySlotUseCase.execute(slotId)).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get("/tickets/active")
                .param("slot", slotId.toString())
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").doesNotExist())
        .andExpect(jsonPath("$.message").value("Active ticket retrieved successfully"));
  }

  @Test
  @DisplayName("POST /tickets/check-in - Should create ticket successfully")
  void shouldCreateTicket() throws Exception {
    UUID tenantId = UUID.randomUUID();
    UUID slotId = UUID.randomUUID();
    UUID rateId = UUID.randomUUID();
    CreateTicket request = new CreateTicket(slotId, rateId, "user@example.com", "ABC123");

    CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket command =
        CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket.builder()
            .slotId(slotId)
            .rateId(rateId)
            .email("user@example.com")
            .plate("ABC123")
            .tenantId(tenantId)
            .build();

    ParkingTickets createdTicket = ParkingTickets.builder().id(UUID.randomUUID()).build();
    ParkingTicketsDTO responseDto = mock(ParkingTicketsDTO.class);

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(parkingTicketMapper.toModel(any(CreateTicket.class))).thenReturn(command);
    when(checkInVehicleWithoutReservationUseCase.execute(any())).thenReturn(createdTicket);
    when(parkingTicketMapper.toDto(createdTicket)).thenReturn(responseDto);

    mockMvc
        .perform(
            post("/tickets/check-in")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.message").value("Ticket created successfully"));
  }

  @Test
  @DisplayName("POST /tickets/check-out - Should checkout vehicle successfully")
  void shouldCheckoutVehicle() throws Exception {
    UUID ticketId = UUID.randomUUID();
    EmailCheckOutCommand command =
        EmailCheckOutCommand.builder()
            .ticketId(ticketId)
            .paymentMethod(PaymentsMethods.EFFECTIVE)
            .email("test@example.com")
            .build();
    EmailCheckOut domainCheckOut =
        EmailCheckOut.builder()
            .ticketId(ticketId)
            .paymentMethod(PaymentsMethods.EFFECTIVE)
            .email("test@example.com")
            .build();
    Payments payment = Payments.builder().id(UUID.randomUUID()).build();
    PaymentsDTO responseDto = mock(PaymentsDTO.class);

    when(paymentsMapper.toModel(any(CheckOutCommand.class))).thenReturn(domainCheckOut);
    when(checkOutVehicleUseCase.execute(domainCheckOut)).thenReturn(payment);
    when(paymentsMapper.toDto(payment)).thenReturn(responseDto);

    mockMvc
        .perform(
            post("/tickets/check-out")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(command)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.message").value("Checkout processed successfully"));
  }
}
