package dev.angelcorzo.nivo.paymentprovider.dtos.response;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import dev.angelcorzo.nivo.model.payments.valueobject.ProviderMetadata;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class PayLinkResponseTest {

  @Test
  void shouldParseDateCorrectly() {
    String expirationDate = "2026-02-26 04:45:01";
    CreatePayLinkResponse response =
        new CreatePayLinkResponse(
            1L,
            "title",
            "description",
            expirationDate,
            1,
            "txtCode",
            1L,
            1,
            1,
            0,
            "COP",
            "sell",
            "url",
            "url",
            0,
            0,
            1000,
            "invoice",
            "qr",
            "link",
            expirationDate);

    ProviderMetadata metadata = response.toProviderMetadata("epayco");

    assertNotNull(metadata);
    assertEquals("invoice", metadata.externalPaymentId());
    assertEquals("link", metadata.checkoutUrl());

    OffsetDateTime expected = OffsetDateTime.of(2026, 2, 26, 4, 45, 1, 0, ZoneOffset.UTC);
    assertEquals(expected, metadata.checkoutExpiresAt());
  }
}
