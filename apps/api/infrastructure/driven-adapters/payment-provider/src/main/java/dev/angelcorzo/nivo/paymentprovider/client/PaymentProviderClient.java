package dev.angelcorzo.nivo.paymentprovider.client;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.paymentprovider.config.PaymentProviderProperties;
import dev.angelcorzo.nivo.paymentprovider.dtos.request.CreatePayLink;
import dev.angelcorzo.nivo.paymentprovider.dtos.request.EpaycoFilterRequest;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.CreatePayLinkResponse;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.EpaycoPagination;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.EpaycoResponse;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.ListPayLinkResponse;
import io.netty.handler.timeout.ReadTimeoutException;
import java.time.Duration;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.codec.DecodingException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentProviderClient {
  private static final Duration TIMEOUT = Duration.ofSeconds(30);
  private final WebClient webClient;
  private final PaymentProviderProperties properties;

  public Result<ListPayLinkResponse, PaymentError> getPayLinkDetails(String checkoutSessionId) {
    try {
      final EpaycoFilterRequest filterRequest =
          new EpaycoFilterRequest("reference", checkoutSessionId);

      return Optional.ofNullable(
              webClient
                  .post()
                  .uri("/collection/link")
                  .bodyValue(filterRequest)
                  .retrieve()
                  .bodyToMono(
                      new ParameterizedTypeReference<
                          EpaycoResponse<EpaycoPagination<ListPayLinkResponse>>>() {})
                  .timeout(TIMEOUT)
                  .block())
          .<Result<ListPayLinkResponse, PaymentError>>map(
              response ->
                  response.fold(
                      data -> Result.success(data.firstData()),
                      _ ->
                          Result.failure(
                              new PaymentError.ProviderValidation(response.titleResponse()))))
          .orElseGet(this::emptyResponseFailure);
    } catch (Exception ex) {
      return Result.failure(handleException(ex));
    }
  }

  public Result<CreatePayLinkResponse, PaymentError> createPayLink(CreatePayLink createPayLink) {
    try {
      return Optional.ofNullable(
              webClient
                  .post()
                  .uri("/collection/link/create")
                  .bodyValue(createPayLink)
                  .retrieve()
                  .bodyToMono(
                      new ParameterizedTypeReference<EpaycoResponse<CreatePayLinkResponse>>() {})
                  .timeout(TIMEOUT)
                  .block())
          .map(this::handleResponse)
          .orElseGet(this::emptyResponseFailure);
    } catch (Exception ex) {
      return Result.failure(handleException(ex));
    }
  }

  private <T> Result<T, PaymentError> emptyResponseFailure() {
    return Result.failure(new PaymentError.ProviderEmptyResponse(properties.getProviderName()));
  }

  private <T> Result<T, PaymentError> handleResponse(EpaycoResponse<T> response) {
    return response.fold(
        Result::success,
        _ -> {
          log.error("Failed to create pay link: {}", response.textResponse());
          return Result.failure(new PaymentError.ProviderValidation(response.textResponse()));
        });
  }

  private PaymentError handleException(Exception ex) {
    log.error("Error inesperado en PaymentProviderClient ({})", properties.getProviderName(), ex);
    if (ex instanceof WebClientResponseException webClientEx) {
      return switch (webClientEx.getStatusCode().value()) {
        case 400 ->
            new PaymentError.ProviderValidation(
                "Bad Request: " + webClientEx.getResponseBodyAsString(), 400);
        case 429 -> new PaymentError.ProviderRateLimited(properties.getProviderName());
        default ->
            new PaymentError.ProviderServerError(
                properties.getProviderName(), webClientEx.getResponseBodyAsString());
      };
    }

    if (ex instanceof ReadTimeoutException) {
      return new PaymentError.ProviderTimeout(properties.getProviderName());
    }

    if (ex instanceof DecodingException) {
      return new PaymentError.ProviderDeserialization(
          properties.getProviderName(), ex.getMessage());
    }

    return new PaymentError.ProviderUnexpectedError(properties.getProviderName(), ex.getMessage());
  }
}
