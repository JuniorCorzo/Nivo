package dev.angelcorzo.nivo.api.payments.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.angelcorzo.nivo.usecase.confirmpayment.ConfirmPaymentUseCase;
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
@WebMvcTest(PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = PaymentController.class)
@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentController Unit Tests")
class PaymentControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private ConfirmPaymentUseCase confirmPaymentUseCase;

  @Test
  @DisplayName("POST /payments/confirmation - Should confirm payment via webhook")
  void shouldConfirmPaymentWebhook() throws Exception {
    mockMvc
        .perform(
            post("/payments/confirmation")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("x_transaction_id", "tx_12345")
                .param("x_amount", "10000"))
        .andExpect(status().isOk());

    verify(confirmPaymentUseCase).execute(any(), any());
  }
}
