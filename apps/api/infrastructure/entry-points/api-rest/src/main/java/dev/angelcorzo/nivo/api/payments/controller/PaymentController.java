package dev.angelcorzo.nivo.api.payments.controller;

import dev.angelcorzo.nivo.usecase.confirmpayment.ConfirmPaymentUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {
  private final ConfirmPaymentUseCase confirmPaymentUseCase;

  @PostMapping(value = "confirmation", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  public ResponseEntity<Object> confirm(@RequestParam MultiValueMap<String, String> form) {
    final String transactionId = form.getFirst("x_transaction_id");

    this.confirmPaymentUseCase.execute(form.toSingleValueMap(), transactionId);

    return ResponseEntity.ok().build();
  }
}
