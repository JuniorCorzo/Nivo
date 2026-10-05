package dev.angelcorzo.nivo.infrastructure.adapter.payment.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record EpaycoError(
    @JsonProperty(value = "totalerrors") String totalErrors, List<ErrorDetail> errors) {

  public record ErrorDetail(int codError, String errorMessage) {}
}
