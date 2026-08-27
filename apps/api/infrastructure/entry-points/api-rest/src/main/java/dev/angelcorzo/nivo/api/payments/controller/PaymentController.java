package dev.angelcorzo.nivo.api.payments.controller;

import dev.angelcorzo.nivo.usecase.confirmpayment.ConfirmPaymentUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
@Tag(name = "Payments", description = "Payment webhook confirmation and processing")
@RequiredArgsConstructor
public class PaymentController {
  private final ConfirmPaymentUseCase confirmPaymentUseCase;

  @Operation(
      summary = "Payment confirmation webhook",
      description = "Receives payment confirmation webhook callbacks from the payment gateway",
      security = {})
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Payment confirmed successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid webhook payload")
  })
  @PostMapping(value = "confirmation", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  public ResponseEntity<Object> confirm(@RequestParam MultiValueMap<String, String> form) {
    final String transactionId = form.getFirst("x_transaction_id");

    this.confirmPaymentUseCase.execute(form.toSingleValueMap(), transactionId);

    return ResponseEntity.ok().build();
  }
}
