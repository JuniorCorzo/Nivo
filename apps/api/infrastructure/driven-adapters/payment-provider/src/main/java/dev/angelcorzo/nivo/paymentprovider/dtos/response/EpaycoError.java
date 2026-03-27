package dev.angelcorzo.nivo.paymentprovider.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record EpaycoError(
    @JsonProperty(value = "totalerrors") String totalErrors, List<ErrorDetail> errors) {

  public record ErrorDetail(int codError, String errorMessage) {}
}
