package dev.angelcorzo.nivo.domain.model.slots.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

@DisplayName("SlotNumberUtils Unit Tests")
class SlotNumberUtilsTest {

  @Test
  @DisplayName("Should throw UnsupportedOperationException when instantiated via reflection")
  void shouldThrowWhenInstantiated() throws NoSuchMethodException {
    Constructor<SlotNumberUtils> constructor = SlotNumberUtils.class.getDeclaredConstructor();
    constructor.setAccessible(true);
    assertThatThrownBy(constructor::newInstance)
        .isInstanceOf(InvocationTargetException.class)
        .hasCauseInstanceOf(UnsupportedOperationException.class);
  }

  @Test
  @DisplayName("Should return old slot number when new prefix is null")
  void shouldReturnOldSlotNumberWhenNewPrefixIsNull() {
    String result = SlotNumberUtils.recalculateSlotNumber("A-01", "A", null);
    assertThat(result).isEqualTo("A-01");
  }

  @Test
  @DisplayName("Should return old slot number when new prefix equals old prefix")
  void shouldReturnOldSlotNumberWhenNewPrefixEqualsOldPrefix() {
    String result = SlotNumberUtils.recalculateSlotNumber("A-01", "A", "A");
    assertThat(result).isEqualTo("A-01");
  }

  @Test
  @DisplayName("Should return null when old slot number is null")
  void shouldReturnNullWhenOldSlotNumberIsNull() {
    String result = SlotNumberUtils.recalculateSlotNumber(null, "A", "B");
    assertThat(result).isNull();
  }

  @ParameterizedTest
  @CsvSource({
      "A-01, A, B, B-01",
      "A-100, A, VIP, VIP-100",
      "ZONE-99, ZONE, SEC, SEC-99"
  })
  @DisplayName("Should replace prefix when old slot number starts with oldPrefix and hyphen")
  void shouldReplacePrefixWithHyphen(String oldNumber, String oldPrefix, String newPrefix, String expected) {
    String result = SlotNumberUtils.recalculateSlotNumber(oldNumber, oldPrefix, newPrefix);
    assertThat(result).isEqualTo(expected);
  }

  @ParameterizedTest
  @CsvSource({
      "A01, A, B, B01",
      "A100, A, VIP, VIP100",
      "B05, B, C, C05"
  })
  @DisplayName("Should replace prefix when old slot number starts with oldPrefix without hyphen")
  void shouldReplacePrefixWithoutHyphen(String oldNumber, String oldPrefix, String newPrefix, String expected) {
    String result = SlotNumberUtils.recalculateSlotNumber(oldNumber, oldPrefix, newPrefix);
    assertThat(result).isEqualTo(expected);
  }

  @ParameterizedTest
  @CsvSource({
      "01, A, VIP, VIP-01",
      "123, B, C, C-123",
      "X-01, A, B, B-X-01"
  })
  @DisplayName("Should prepend new prefix with hyphen when old slot number does not start with oldPrefix")
  void shouldPrependWhenDoesNotStartWithOldPrefix(String oldNumber, String oldPrefix, String newPrefix, String expected) {
    String result = SlotNumberUtils.recalculateSlotNumber(oldNumber, oldPrefix, newPrefix);
    assertThat(result).isEqualTo(expected);
  }

  @Test
  @DisplayName("Should prepend new prefix with hyphen when old prefix is null")
  void shouldPrependWhenOldPrefixIsNull() {
    String result = SlotNumberUtils.recalculateSlotNumber("01", null, "VIP");
    assertThat(result).isEqualTo("VIP-01");
  }

  @Test
  @DisplayName("Should prepend new prefix with hyphen when old prefix is empty")
  void shouldPrependWhenOldPrefixIsEmpty() {
    String result = SlotNumberUtils.recalculateSlotNumber("01", "", "VIP");
    assertThat(result).isEqualTo("VIP-01");
  }

  @Test
  @DisplayName("Should remove prefix when new prefix is empty")
  void shouldRemovePrefixWhenNewPrefixIsEmpty() {
    String result = SlotNumberUtils.recalculateSlotNumber("A-01", "A", "");
    assertThat(result).isEqualTo("01");
  }

  @Test
  @DisplayName("Should remove prefix without hyphen when new prefix is empty")
  void shouldRemovePrefixWithoutHyphenWhenNewPrefixIsEmpty() {
    String result = SlotNumberUtils.recalculateSlotNumber("A01", "A", "");
    assertThat(result).isEqualTo("01");
  }
}
