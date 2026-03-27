package dev.angelcorzo.nivo.paymentprovider.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.paymentprovider.config.PaymentProviderProperties;
import dev.angelcorzo.nivo.paymentprovider.dtos.request.CreatePayLink;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.CreatePayLinkResponse;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.EpaycoError;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.EpaycoResponse;
import io.netty.handler.timeout.ReadTimeoutException;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.codec.DecodingException;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class PaymentProviderClientTest {

  @Mock private WebClient webClient;
  @Mock private WebClient.RequestBodyUriSpec requestBodyUriSpec;
  @Mock private WebClient.RequestBodySpec requestBodySpec;

  @Mock
  private WebClient.RequestHeadersSpec
      requestHeadersSpec; // raw type avoids wildcard capture issues

  @Mock private WebClient.ResponseSpec responseSpec;

  private PaymentProviderProperties properties;
  private PaymentProviderClient client;

  @BeforeEach
  void setUp() {
    properties = new PaymentProviderProperties();
    properties.setProviderName("epayco");
    properties.setUrl("https://api.epayco.co");
    client = new PaymentProviderClient(webClient, properties);
  }

  private CreatePayLink dummyRequest() {
    return CreatePayLink.builder()
        .id(0)
        .title("Test")
        .description("Test payment")
        .quantity(1)
        .currency("COP")
        .build();
  }

  @SuppressWarnings("unchecked")
  private void stubWebClientToThrow(Exception exception) {
    when(webClient.post()).thenReturn(requestBodyUriSpec);
    when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
    when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
    when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
    when(responseSpec.bodyToMono(any(ParameterizedTypeReference.class)))
        .thenReturn(Mono.error(exception));
  }

  @SuppressWarnings("unchecked")
  private void stubWebClientToReturn(EpaycoResponse<CreatePayLinkResponse> response) {
    when(webClient.post()).thenReturn(requestBodyUriSpec);
    when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
    when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
    when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
    when(responseSpec.bodyToMono(any(ParameterizedTypeReference.class)))
        .thenReturn(Mono.justOrEmpty(response));
  }

  // --- Success ---

  @Test
  @DisplayName("Should return success when provider responds with valid pay link")
  void shouldReturnSuccessOnValidResponse() {
    CreatePayLinkResponse payLink = buildPayLinkResponse();
    EpaycoResponse<CreatePayLinkResponse> response =
        new EpaycoResponse.Success<>(true, "OK", "OK", "OK", payLink);

    stubWebClientToReturn(response);

    Result<CreatePayLinkResponse, PaymentError> result = client.createPayLink(dummyRequest());

    assertThat(result.isSuccess()).isTrue();
    assertThat(result.get()).isEqualTo(payLink);
  }

  // --- Empty Response ---

  @Test
  @DisplayName("Should return ProviderEmptyResponse when provider returns null body")
  void shouldReturnProviderEmptyResponseOnNullBody() {
    stubWebClientToReturn(null);

    Result<CreatePayLinkResponse, PaymentError> result = client.createPayLink(dummyRequest());

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderEmptyResponse.class);
    assertThat(result.getError().code()).isEqualTo("PROVIDER_EMPTY_RESPONSE");
  }

  // --- Epayco Error Response ---

  @Test
  @DisplayName("Should return ProviderValidation when provider responds with error")
  void shouldReturnProviderValidationOnEpaycoError() {
    EpaycoError error =
        new EpaycoError("1", List.of(new EpaycoError.ErrorDetail(100, "Some error")));
    EpaycoResponse<CreatePayLinkResponse> response =
        new EpaycoResponse.Failure<>(false, "Error", "Error", "Error", error);

    stubWebClientToReturn(response);

    Result<CreatePayLinkResponse, PaymentError> result = client.createPayLink(dummyRequest());

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderValidation.class);
    assertThat(result.getError().code()).isEqualTo("PROVIDER_VALIDATION");
  }

  // --- HTTP 400 Bad Request ---

  @Test
  @DisplayName("Should return ProviderValidation on HTTP 400")
  void shouldReturnProviderValidationOnBadRequest() {
    WebClientResponseException exception =
        WebClientResponseException.create(
            400, "Bad Request", null, "invalid body".getBytes(), null);

    stubWebClientToThrow(exception);

    Result<CreatePayLinkResponse, PaymentError> result = client.createPayLink(dummyRequest());

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderValidation.class);
    assertThat(result.getError().status()).isEqualTo(400);
  }

  // --- HTTP 429 Rate Limited ---

  @Test
  @DisplayName("Should return ProviderRateLimited on HTTP 429")
  void shouldReturnProviderRateLimitedOnTooManyRequests() {
    WebClientResponseException exception =
        WebClientResponseException.create(429, "Too Many Requests", null, null, null);

    stubWebClientToThrow(exception);

    Result<CreatePayLinkResponse, PaymentError> result = client.createPayLink(dummyRequest());

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderRateLimited.class);
    assertThat(result.getError().code()).isEqualTo("PROVIDER_RATE_LIMITED");
    assertThat(result.getError().status()).isEqualTo(429);
  }

  // --- HTTP 500 Server Error ---

  @Test
  @DisplayName("Should return ProviderServerError on HTTP 500")
  void shouldReturnProviderServerErrorOnInternalServerError() {
    WebClientResponseException exception =
        WebClientResponseException.create(
            500, "Internal Server Error", null, "server failure".getBytes(), null);

    stubWebClientToThrow(exception);

    Result<CreatePayLinkResponse, PaymentError> result = client.createPayLink(dummyRequest());

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderServerError.class);
    assertThat(result.getError().code()).isEqualTo("PROVIDER_SERVER_ERROR");
    assertThat(result.getError().status()).isEqualTo(502);
  }

  // --- HTTP other status ---

  @Test
  @DisplayName("Should return ProviderServerError on unexpected HTTP status")
  void shouldReturnProviderServerErrorOnUnexpectedStatus() {
    WebClientResponseException exception =
        WebClientResponseException.create(503, "Service Unavailable", null, null, null);

    stubWebClientToThrow(exception);

    Result<CreatePayLinkResponse, PaymentError> result = client.createPayLink(dummyRequest());

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderServerError.class);
    assertThat(result.getError().code()).isEqualTo("PROVIDER_SERVER_ERROR");
  }

  // --- ReadTimeoutException ---

  @Test
  @DisplayName("Should return ProviderTimeout on ReadTimeoutException")
  void shouldReturnProviderTimeoutOnReadTimeout() {
    stubWebClientToThrow(ReadTimeoutException.INSTANCE);

    Result<CreatePayLinkResponse, PaymentError> result = client.createPayLink(dummyRequest());

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderTimeout.class);
    assertThat(result.getError().code()).isEqualTo("PROVIDER_TIMEOUT");
    assertThat(result.getError().status()).isEqualTo(504);
  }

  // --- DecodingException ---

  @Test
  @DisplayName("Should return ProviderDeserialization on DecodingException")
  void shouldReturnProviderDeserializationOnDecodingException() {
    DecodingException exception = new DecodingException("Unexpected token");

    stubWebClientToThrow(exception);

    Result<CreatePayLinkResponse, PaymentError> result = client.createPayLink(dummyRequest());

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderDeserialization.class);
    assertThat(result.getError().code()).isEqualTo("PROVIDER_DESERIALIZATION");
    assertThat(result.getError().status()).isEqualTo(502);
  }

  // --- Generic Exception (catch-all) ---

  @Test
  @DisplayName("Should return ProviderUnexpectedError on unknown exception")
  void shouldReturnProviderUnexpectedErrorOnGenericException() {
    RuntimeException exception = new RuntimeException("Something went wrong");

    stubWebClientToThrow(exception);

    Result<CreatePayLinkResponse, PaymentError> result = client.createPayLink(dummyRequest());

    assertThat(result.isFailure()).isTrue();
    assertThat(result.getError()).isInstanceOf(PaymentError.ProviderUnexpectedError.class);
    assertThat(result.getError().code()).isEqualTo("PROVIDER_UNEXPECTED_ERROR");
    assertThat(result.getError().status()).isEqualTo(500);
  }

  private CreatePayLinkResponse buildPayLinkResponse() {
    return new CreatePayLinkResponse(
        1L,
        "title",
        "desc",
        "2026-03-01 12:00:00",
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
        "2026-03-01 13:00:00");
  }
}
