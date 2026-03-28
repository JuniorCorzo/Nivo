package dev.angelcorzo.nivo.model.rates.enums;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import lombok.Getter;

@Getter
public enum TimeUnitsRate {
  DAYS(ChronoUnit.DAYS, "Dias", "D"),
  HOURS(ChronoUnit.HOURS, "Horas", "H"),
  MINUTES(ChronoUnit.MINUTES, "Minutos", "M");

  private final ChronoUnit chronoUnit;
  private final String name;
  private final String nameAbbreviated;

  TimeUnitsRate(ChronoUnit chronoUnit, String name, String nameAbbreviated) {
    this.chronoUnit = chronoUnit;
    this.name = name;
    this.nameAbbreviated = nameAbbreviated;
  }

  public long getDurationTime(Duration duration) {
    return switch (this) {
      case DAYS -> duration.toDays();
      case HOURS -> duration.toHours();
      case MINUTES -> duration.toMinutes();
    };
  }
}
