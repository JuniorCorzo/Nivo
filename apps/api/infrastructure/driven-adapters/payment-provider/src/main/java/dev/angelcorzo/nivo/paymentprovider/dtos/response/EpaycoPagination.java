package dev.angelcorzo.nivo.paymentprovider.dtos.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record EpaycoPagination<T>(
    String currentPage,
    List<T> data,
    String firstPageUrl,
    Integer from,
    Integer lastPage,
    String lastPageUrl,
    List<Link> links,
    String nextPageUrl,
    String path,
    Integer perPage,
    String prevPageUrl,
    Integer to,
    Integer total) {

  public T firstData() {
    if (data == null) return null;
    return data.stream().findFirst().orElse(null);
  }

  public record Link(String url, String label, boolean active) {}
}
