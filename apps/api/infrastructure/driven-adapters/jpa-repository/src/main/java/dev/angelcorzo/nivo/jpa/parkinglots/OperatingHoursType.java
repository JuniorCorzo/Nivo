package dev.angelcorzo.nivo.jpa.parkinglots;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.OffsetTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Struct;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
@Struct(name = "operating_hours_t")
public class OperatingHoursType {
  @Column(name = "open_time")
  private OffsetTime openTime;
  @Column(name = "close_time")
  private OffsetTime closeTime;
}
