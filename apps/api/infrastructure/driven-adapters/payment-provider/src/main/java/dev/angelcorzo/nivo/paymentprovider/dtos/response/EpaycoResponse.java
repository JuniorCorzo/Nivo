package dev.angelcorzo.nivo.paymentprovider.dtos.response;

import dev.angelcorzo.nivo.paymentprovider.config.json.EpaycoResponseDeserializer;
import java.util.function.Function;
import tools.jackson.databind.annotation.JsonDeserialize;

@JsonDeserialize(using = EpaycoResponseDeserializer.class)
public sealed interface EpaycoResponse<T> permits EpaycoResponse.Success, EpaycoResponse.Failure {
  boolean success();

  String titleResponse();

  String textResponse();

  String lastResponse();

  default T get() {
    if (this.isFailure()) return null;

    return ((Success<T>) this).data;
  }

  default EpaycoError error() {
    if (this.isSuccess()) return null;

    return ((Failure<T>) this).data;
  }

  default <R> R fold(Function<T, R> onSuccess, Function<EpaycoError, R> onFailure) {
    return isSuccess() ? onSuccess.apply(get()) : onFailure.apply(error());
  }

  default boolean isSuccess() {
    return this instanceof EpaycoResponse.Success;
  }

  default boolean isFailure() {
    return this instanceof EpaycoResponse.Failure;
  }

  record Success<T>(
      boolean success, String titleResponse, String textResponse, String lastResponse, T data)
      implements EpaycoResponse<T> {}

  record Failure<T>(
      boolean success,
      String titleResponse,
      String textResponse,
      String lastResponse,
      EpaycoError data)
      implements EpaycoResponse<T> {}
}
