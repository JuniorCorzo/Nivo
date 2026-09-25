package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailySummaryId implements Serializable {
  private UUID parkingLotId;
  private LocalDate summaryDate;

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    DailySummaryId that = (DailySummaryId) o;
    return Objects.equals(parkingLotId, that.parkingLotId) &&
           Objects.equals(summaryDate, that.summaryDate);
  }

  @Override
  public int hashCode() {
    return Objects.hash(parkingLotId, summaryDate);
  }
}
