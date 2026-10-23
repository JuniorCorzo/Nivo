package dev.angelcorzo.nivo.infrastructure.adapter.notifications.formatters;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.domain.model.commons.notifications.valueobjects.UserInvitedData;
import dev.angelcorzo.nivo.domain.model.commons.notifications.valueobjects.UserSelfRegisterData;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("HtmlNotificationBuilder Unit Tests")
class HtmlNotificationBuilderTest {

  private HtmlNotificationBuilder builder;
  private UserInvitedData content;

  @BeforeEach
  void setUp() {
    builder = new HtmlNotificationBuilder();
    content = UserInvitedData.builder()
      .userName("John Doe")
      .inviterName("Jane Doe")
      .organizationName("Acme Corp")
      .roleName("Admin")
      .ctaUrl("https://nivo.dev/invite/123")
      .companyName("Nivo Inc")
      .supportUrl("https://nivo.dev/support")
      .build();
  }

  @Test
  @DisplayName("Should interpolate subject with double and single curly braces")
  void shouldInterpolateSubjectWithDoubleAndSingleBraces() {
    final NotificationTemplates template = NotificationTemplates.builder()
      .name("Welcome {{userName}} to {organizationName}!")
      .eventType(NotificationEvents.USER_INVITED)
      .build();

    final String subject = builder.buildSubject(template, content);

    assertThat(subject).isEqualTo("Welcome John Doe to Acme Corp!");
  }

  @Test
  @DisplayName("Should fallback subject to event name when template name is blank or null")
  void shouldFallbackSubjectWhenTemplateNameIsBlankOrNull() {
    final NotificationTemplates nullNameTemplate = NotificationTemplates.builder()
      .name(null)
      .eventType(NotificationEvents.USER_INVITED)
      .build();
    final NotificationTemplates blankNameTemplate = NotificationTemplates.builder()
      .name("   ")
      .eventType(NotificationEvents.PAYMENT_COMPLETED)
      .build();
    final NotificationTemplates nullEventTemplate = NotificationTemplates.builder().name(null).eventType(null).build();

    final String subjectNull = builder.buildSubject(nullNameTemplate, content);
    final String subjectBlank = builder.buildSubject(blankNameTemplate, content);
    final String subjectNullEvent = builder.buildSubject(nullEventTemplate, content);
    final String subjectNullTemplate = builder.buildSubject(null, content);

    assertThat(subjectNull).isEqualTo("Nivo - USER_INVITED");
    assertThat(subjectBlank).isEqualTo("Nivo - PAYMENT_COMPLETED");
    assertThat(subjectNullEvent).isEqualTo("Nivo Notification");
    assertThat(subjectNullTemplate).isEqualTo("Nivo Notification");
  }

  @Test
  @DisplayName("Should handle missing or null placeholder values in subject gracefully")
  void shouldHandleMissingOrNullPlaceholderValuesInSubjectGracefully() {
    final NotificationTemplates template = NotificationTemplates.builder()
      .name("Alert for {{userName}} - status: {missingKey} code: {{nullKey}}")
      .eventType(NotificationEvents.USER_INVITED)
      .build();

    final String subject = builder.buildSubject(template, content);

    assertThat(subject).isEqualTo("Alert for John Doe - status:  code: ");
  }

  @Test
  @DisplayName("Should handle null content gracefully in buildSubject")
  void shouldHandleNullContentGracefullyInBuildSubject() {
    final NotificationTemplates template = NotificationTemplates.builder()
      .name("Welcome {{userName}}!")
      .eventType(NotificationEvents.USER_INVITED)
      .build();

    final String subject = builder.buildSubject(template, null);

    assertThat(subject).isEqualTo("Welcome !");
  }

  @Test
  @DisplayName("Should interpolate custom template body containing double and single braces")
  void shouldInterpolateCustomTemplateBody() {
    final String bodyTemplate = "<div><h1>Hello {{userName}}</h1><p>Invite for {organizationName}</p></div>";
    final NotificationTemplates template = NotificationTemplates.builder()
      .id(UUID.randomUUID())
      .name("Invitation")
      .eventType(NotificationEvents.USER_INVITED)
      .channel(NotificationsChannel.EMAIL)
      .body(bodyTemplate)
      .build();

    final String html = builder.buildHtml(template, content);

    assertThat(html)
      .isEqualTo("<div><h1>Hello John Doe</h1><p>Invite for Acme Corp</p></div>");
  }

  @Test
  @DisplayName("Should handle missing and null placeholders gracefully in custom template body")
  void shouldHandleMissingOrNullPlaceholdersInCustomBody() {
    final String bodyTemplate = "<p>Hello {{userName}}, code: {missingCode}, extra: {{extraNull}}</p>";
    final NotificationTemplates template = NotificationTemplates.builder()
      .body(bodyTemplate)
      .eventType(NotificationEvents.USER_INVITED)
      .build();

    final String html = builder.buildHtml(template, content);

    assertThat(html).isEqualTo("<p>Hello John Doe, code: , extra: </p>");
  }

  @Test
  @DisplayName("Should generate default responsive HTML layout when body is null")
  void shouldGenerateDefaultResponsiveHtmlWhenBodyIsNull() {
    final NotificationTemplates template = NotificationTemplates.builder()
      .eventType(NotificationEvents.USER_INVITED)
      .body(null)
      .build();

    final String html = builder.buildHtml(template, content);

    assertThat(html).isNotNull();
    assertThat(html).contains("font-family: -apple-system, sans-serif;");
    assertThat(html).contains("max-width: 600px;");
    assertThat(html).contains("padding: 20px;");
    assertThat(html).contains("Nivo");
    assertThat(html).contains("John Doe");
    assertThat(html).contains("Acme Corp");
    assertThat(html).contains("Nivo Inc");
    assertThat(html).contains("https://nivo.dev/support");
  }

  @Test
  @DisplayName("Should generate default responsive HTML layout when body is blank")
  void shouldGenerateDefaultResponsiveHtmlWhenBodyIsBlank() {
    final NotificationTemplates template = NotificationTemplates.builder()
      .eventType(NotificationEvents.USER_INVITED)
      .body("   ")
      .build();

    final String html = builder.buildHtml(template, content);

    assertThat(html).isNotNull();
    assertThat(html).contains("font-family: -apple-system, sans-serif;");
    assertThat(html).contains("max-width: 600px;");
    assertThat(html).contains("padding: 20px;");
    assertThat(html).contains("Nivo");
    assertThat(html).contains("John Doe");
    assertThat(html).contains("Nivo Inc");
    assertThat(html).contains("https://nivo.dev/support");
  }

  @Test
  @DisplayName("Should handle null content gracefully in buildHtml")
  void shouldHandleNullContentGracefullyInBuildHtml() {
    final NotificationTemplates template = NotificationTemplates.builder()
      .eventType(NotificationEvents.USER_INVITED)
      .body(null)
      .build();

    final String html = builder.buildHtml(template, null);

    assertThat(html).isNotNull();
    assertThat(html).contains("font-family: -apple-system, sans-serif;");
    assertThat(html).contains("max-width: 600px;");
    assertThat(html).contains("padding: 20px;");
    assertThat(html).contains("Nivo");
    assertThat(html).contains("https://nivo.dev/support");
  }

  @Test
  @DisplayName("Should handle null template gracefully in buildHtml")
  void shouldHandleNullTemplateGracefullyInBuildHtml() {
    final String html = builder.buildHtml(null, content);

    assertThat(html).isNotNull();
    assertThat(html).contains("font-family: -apple-system, sans-serif;");
    assertThat(html).contains("max-width: 600px;");
    assertThat(html).contains("padding: 20px;");
    assertThat(html).contains("Nivo");
    assertThat(html).contains("John Doe");
    assertThat(html).contains("Nivo Inc");
  }

  @Test
  @DisplayName("Should interpolate Impeccable welcome template and subject correctly")
  void shouldInterpolateImpeccableWelcomeTemplateAndSubject() throws IOException {
    final String templateHtml;
    try (final InputStream in = getClass().getResourceAsStream("/templates/emails/user-self-registered.html")) {
      assertThat(in).isNotNull();
      templateHtml = new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }

    final NotificationTemplates template = NotificationTemplates.builder()
      .name("Bienvenido a {{companyName}}")
      .eventType(NotificationEvents.USER_SELF_REGISTERED)
      .channel(NotificationsChannel.EMAIL)
      .templateReference("brevo-user-self-registered")
      .body(templateHtml)
      .build();

    final UserSelfRegisterData registerData = UserSelfRegisterData.builder()
      .userName("Carlos Gomez")
      .email("carlos@example.com")
      .companyName("Nivo Operations")
      .ctaUrl("https://nivo.dev/dashboard")
      .supportUrl("https://nivo.dev/support")
      .companyAddress("Calle 100 #15-20, Bogota")
      .socialUrl("https://twitter.com/nivo")
      .unsubscribeUrl("https://nivo.dev/unsubscribe")
      .build();

    final String subject = builder.buildSubject(template, registerData);
    final String html = builder.buildHtml(template, registerData);

    assertThat(subject).isEqualTo("Bienvenido a Nivo Operations");
    assertThat(html).contains("Tu cuenta en Nivo Operations está lista");
    assertThat(html).contains("Hola Carlos Gomez, tu registro fue exitoso.");
    assertThat(html).contains("carlos@example.com");
    assertThat(html).contains("https://nivo.dev/dashboard");
    assertThat(html).contains("Calle 100 #15-20, Bogota");
    assertThat(html).contains("https://nivo.dev/support");
    assertThat(html).contains("https://nivo.dev/unsubscribe");
    assertThat(html).doesNotContain("{{").doesNotContain("}}");
  }

  @Test
  @DisplayName("Should interpolate Impeccable invited user template and subject correctly")
  void shouldInterpolateImpeccableInvitedUserTemplateAndSubject() throws IOException {
    final String templateHtml;
    try (final InputStream in = getClass().getResourceAsStream("/templates/emails/user-invited.html")) {
      assertThat(in).isNotNull();
      templateHtml = new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }

    final NotificationTemplates template = NotificationTemplates.builder()
      .name("Te han invitado a unirte a {{organizationName}} en Nivo")
      .eventType(NotificationEvents.USER_INVITED)
      .channel(NotificationsChannel.EMAIL)
      .templateReference("brevo-user-invited")
      .body(templateHtml)
      .build();

    final UserInvitedData invitedData = UserInvitedData.builder()
      .userName("Maria Lopez")
      .inviterName("Carlos Gomez")
      .organizationName("Parqueaderos Norte")
      .roleName("OPERATOR")
      .ctaUrl("https://nivo.dev/invitation/accept?token=abc-123")
      .expirationDate("30 de Noviembre, 2026")
      .companyName("Nivo Inc")
      .companyAddress("Carrera 7 #71-21, Bogota")
      .supportUrl("https://nivo.dev/support")
      .unsubscribeUrl("https://nivo.dev/unsubscribe")
      .build();

    final String subject = builder.buildSubject(template, invitedData);
    final String html = builder.buildHtml(template, invitedData);

    assertThat(subject).isEqualTo("Te han invitado a unirte a Parqueaderos Norte en Nivo");
    assertThat(html).contains("Te han invitado a unirte a Parqueaderos Norte");
    assertThat(html).contains("Hola Maria Lopez");
    assertThat(html).contains("Carlos Gomez");
    assertThat(html).contains("OPERATOR");
    assertThat(html).contains("30 de Noviembre, 2026");
    assertThat(html).contains("https://nivo.dev/invitation/accept?token=abc-123");
    assertThat(html).contains("Carrera 7 #71-21, Bogota");
    assertThat(html).doesNotContain("{{").doesNotContain("}}");
  }
}
