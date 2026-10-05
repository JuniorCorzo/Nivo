package dev.angelcorzo.nivo.domain.usecase.rate.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import java.time.Duration;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("StayInterval Value Object Tests")
class StayIntervalTest {

  @Test
  @DisplayName("Should create valid stay interval and compute duration")
  void shouldCreateValidStayInterval() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:30:00Z");

    StayInterval interval = StayInterval.of(entry, exit);

    assertThat(interval.entryTime()).isEqualTo(entry);
    assertThat(interval.exitTime()).isEqualTo(exit);
    assertThat(interval.duration()).isEqualTo(Duration.ofMinutes(90));
    assertThat(interval.toMinutes()).isEqualTo(90);
  }

  @Test
  @DisplayName("Should allow zero duration when entry time equals exit time")
  void shouldAllowZeroDurationWhenEntryEqualsExit() {
    OffsetDateTime time = OffsetDateTime.parse("2026-09-07T10:00:00Z");

    StayInterval interval = StayInterval.of(time, time);

    assertThat(interval.duration()).isEqualTo(Duration.ZERO);
    assertThat(interval.toMinutes()).isZero();
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when entry time is null")
  void shouldThrowWhenEntryTimeIsNull() {
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:00:00Z");

    assertThatThrownBy(() -> StayInterval.of(null, exit))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Entry time and exit time cannot be null");
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when exit time is null")
  void shouldThrowWhenExitTimeIsNull() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");

    assertThatThrownBy(() -> StayInterval.of(entry, null))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Entry time and exit time cannot be null");
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when both times are null")
  void shouldThrowWhenBothTimesAreNull() {
    assertThatThrownBy(() -> StayInterval.of(null, null))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Entry time and exit time cannot be null");
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when exit time is before entry time")
  void shouldThrowWhenExitTimeIsBeforeEntryTime() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T12:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:00:00Z");

    assertThatThrownBy(() -> StayInterval.of(entry, exit))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Exit time cannot be before entry time");
  }

  @Test
  @DisplayName("Canonical constructor should enforce null invariants")
  void canonicalConstructorShouldEnforceNullInvariants() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");

    assertThatThrownBy(() -> new StayInterval(null, entry, Duration.ofMinutes(10)))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Entry time and exit time cannot be null");

    assertThatThrownBy(() -> new StayInterval(entry, null, Duration.ofMinutes(10)))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Entry time and exit time cannot be null");
  }

  @Test
  @DisplayName("Canonical constructor should enforce exit after entry invariant")
  void canonicalConstructorShouldEnforceOrderingInvariant() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T12:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:00:00Z");

    assertThatThrownBy(() -> new StayInterval(entry, exit, Duration.ofMinutes(10)))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Exit time cannot be before entry time");
  }

  @Test
  @DisplayName("Canonical constructor should compute duration if null is passed")
  void canonicalConstructorShouldComputeDurationIfNull() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:00:00Z");

    StayInterval interval = new StayInterval(entry, exit, null);

    assertThat(interval.duration()).isEqualTo(Duration.ofMinutes(60));
  }
}
