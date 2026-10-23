package dev.angelcorzo.nivo.infrastructure.adapter.notifications.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("EmailAddressParser Unit Tests")
class EmailAddressParserTest {

  @Test
  @DisplayName("Should parse RFC 822 formatted address with no space between name and angle bracket")
  void shouldParseWithoutSpace() {
    final EmailAddressParser.ParsedEmailAddress result = EmailAddressParser
      .parse("Nivo<notifications@nivo.angelcorzo.dev>");

    assertThat(result.name()).isEqualTo("Nivo");
    assertThat(result.email()).isEqualTo("notifications@nivo.angelcorzo.dev");
  }

  @Test
  @DisplayName("Should parse standard RFC 822 formatted address with space")
  void shouldParseWithSpace() {
    final EmailAddressParser.ParsedEmailAddress result = EmailAddressParser
      .parse("Nivo <notifications@nivo.angelcorzo.dev>");

    assertThat(result.name()).isEqualTo("Nivo");
    assertThat(result.email()).isEqualTo("notifications@nivo.angelcorzo.dev");
  }

  @Test
  @DisplayName("Should parse quoted name RFC 822 address")
  void shouldParseWithQuotedName() {
    final EmailAddressParser.ParsedEmailAddress result = EmailAddressParser
      .parse("\"Nivo Support Team\" <support@nivo.angelcorzo.dev>");

    assertThat(result.name()).isEqualTo("Nivo Support Team");
    assertThat(result.email()).isEqualTo("support@nivo.angelcorzo.dev");
  }

  @Test
  @DisplayName("Should parse address inside angle brackets with no name")
  void shouldParseAngleBracketsOnly() {
    final EmailAddressParser.ParsedEmailAddress result = EmailAddressParser
      .parse("<notifications@nivo.angelcorzo.dev>");

    assertThat(result.name()).isNull();
    assertThat(result.email()).isEqualTo("notifications@nivo.angelcorzo.dev");
  }

  @Test
  @DisplayName("Should parse plain email address without brackets")
  void shouldParsePlainEmail() {
    final EmailAddressParser.ParsedEmailAddress result = EmailAddressParser.parse("notifications@nivo.angelcorzo.dev");

    assertThat(result.name()).isNull();
    assertThat(result.email()).isEqualTo("notifications@nivo.angelcorzo.dev");
  }

  @Test
  @DisplayName("Should trim whitespace around plain email and name")
  void shouldTrimWhitespace() {
    final EmailAddressParser.ParsedEmailAddress result = EmailAddressParser
      .parse("   John Doe   <   john.doe@example.com   >   ");

    assertThat(result.name()).isEqualTo("John Doe");
    assertThat(result.email()).isEqualTo("john.doe@example.com");
  }

  @ParameterizedTest
  @NullAndEmptySource
  @ValueSource(strings = {"   "})
  @DisplayName("Should return null name and empty email on null or blank input")
  void shouldHandleNullOrBlank(String input) {
    final EmailAddressParser.ParsedEmailAddress result = EmailAddressParser.parse(input);

    assertThat(result.name()).isNull();
    assertThat(result.email()).isEmpty();
  }
}
