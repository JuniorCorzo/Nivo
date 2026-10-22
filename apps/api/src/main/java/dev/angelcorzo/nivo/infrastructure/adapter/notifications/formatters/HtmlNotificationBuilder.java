package dev.angelcorzo.nivo.infrastructure.adapter.notifications.formatters;

import java.util.Collections;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;
import dev.angelcorzo.nivo.domain.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;

/**
 * Builds email subjects and responsive HTML content for transactional notifications.
 */
@Component
public class HtmlNotificationBuilder {

  private static final String DEFAULT_COMPANY_NAME = "Nivo";
  private static final String DEFAULT_SUPPORT_URL = "https://nivo.dev/support";
  private static final String DEFAULT_SUBJECT = "Nivo Notification";

  private static final Pattern PLACEHOLDER_PATTERN = Pattern
    .compile("\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}|\\{\\s*([a-zA-Z0-9_]+)\\s*\\}");

  /**
   * Builds the email subject line by interpolating placeholders from the notification content. If template name is
   * blank or missing, falls back to event type or a default subject.
   */
  public String buildSubject(
    final NotificationTemplates template,
    final NotificationsData content) {
    if (template != null && template.getName() != null && !template.getName().isBlank()) {
      return interpolate(template.getName(), content);
    }
    if (template != null && template.getEventType() != null) {
      return "Nivo - " + template.getEventType();
    }
    return DEFAULT_SUBJECT;
  }

  /**
   * Builds the HTML email content. If a custom template body is provided, placeholders are interpolated; otherwise, a
   * default responsive email layout with inline styles is generated.
   */
  public String buildHtml(
    final NotificationTemplates template,
    final NotificationsData content) {
    if (template != null && template.getBody() != null && !template.getBody().isBlank()) {
      return interpolate(template.getBody(), content);
    }
    return generateDefaultHtml(template, content);
  }

  private String interpolate(final String text, final NotificationsData content) {
    if (text == null || text.isBlank()) {
      return "";
    }
    final Map<String, String> dataMap = extractDataMap(content);
    final Matcher matcher = PLACEHOLDER_PATTERN.matcher(text);
    final StringBuilder sb = new StringBuilder();

    while (matcher.find()) {
      final String key = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
      String value = dataMap.get(key);
      if (value == null) {
        for (final Map.Entry<String, String> entry : dataMap.entrySet()) {
          if (entry.getKey().equalsIgnoreCase(key)) {
            value = entry.getValue();
            break;
          }
        }
      }
      final String replacement = (value == null || "null".equalsIgnoreCase(value)) ? "" : value;
      matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
    }
    matcher.appendTail(sb);
    return sb.toString();
  }

  private String generateDefaultHtml(
    final NotificationTemplates template,
    final NotificationsData content) {
    final Map<String, String> dataMap = extractDataMap(content);
    final String companyName = resolveCompanyName(content, dataMap);
    final String supportUrl = resolveSupportUrl(content, dataMap);

    final StringBuilder rows = new StringBuilder();
    for (final Map.Entry<String, String> entry : dataMap.entrySet()) {
      final String val = entry.getValue();
      if (val != null && !val.isBlank() && !"null".equalsIgnoreCase(val)) {
        rows.append("<tr>")
          .append("<td style=\"padding: 8px 12px; font-weight: 600; color: #4b5563; ")
          .append("border-bottom: 1px solid #e5e7eb; width: 40%;\">")
          .append(escapeHtml(entry.getKey()))
          .append("</td>")
          .append("<td style=\"padding: 8px 12px; color: #111827; ")
          .append("border-bottom: 1px solid #e5e7eb;\">")
          .append(escapeHtml(val))
          .append("</td>")
          .append("</tr>");
      }
    }

    final String contentSection = !rows.isEmpty()
      ? "<div style=\"margin: 20px 0;\"><table style=\"width: 100%; border-collapse: collapse; "
        + "font-size: 14px;\"><tbody>"
        + rows
        + "</tbody></table></div>"
      : "<div style=\"margin: 20px 0;\"><p style=\"margin: 0; color: #4b5563; font-size: 14px;\">"
        + "Notification details.</p></div>";

    return "<!DOCTYPE html>"
      + "<html lang=\"en\">"
      + "<head>"
      + "<meta charset=\"UTF-8\">"
      + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
      + "<title>Nivo</title>"
      + "</head>"
      + "<body style=\"font-family: -apple-system, sans-serif; margin: 0; padding: 0; "
      + "background-color: #f9fafb;\">"
      + "<div style=\"max-width: 600px; margin: 0 auto; padding: 20px; "
      + "background-color: #ffffff; border-radius: 8px;\">"
      + "<div style=\"text-align: center; padding-bottom: 20px; "
      + "border-bottom: 1px solid #e5e7eb;\">"
      + "<h1 style=\"margin: 0; font-size: 24px; font-weight: 700; color: #111827;\">Nivo</h1>"
      + "</div>"
      + contentSection
      + "<div style=\"margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; "
      + "text-align: center; font-size: 12px; color: #6b7280;\">"
      + "<p style=\"margin: 0 0 8px;\">&copy; "
      + escapeHtml(companyName)
      + ". All rights reserved.</p>"
      + "<p style=\"margin: 0;\"><a href=\""
      + escapeHtml(supportUrl)
      + "\" style=\"color: #2563eb; text-decoration: underline;\">Support</a></p>"
      + "</div>"
      + "</div>"
      + "</body>"
      + "</html>";
  }

  private Map<String, String> extractDataMap(final NotificationsData content) {
    if (content == null) {
      return Collections.emptyMap();
    }
    try {
      final Map<String, String> map = content.toMap();
      return map != null ? map : Collections.emptyMap();
    } catch (final Exception e) {
      return Collections.emptyMap();
    }
  }

  private String resolveCompanyName(
    final NotificationsData content,
    final Map<String, String> dataMap) {
    if (content != null
      && content.companyName() != null
      && !content.companyName().isBlank()
      && !"null".equalsIgnoreCase(content.companyName())) {
      return content.companyName();
    }
    final String fromMap = dataMap.get("companyName");
    if (fromMap != null && !fromMap.isBlank() && !"null".equalsIgnoreCase(fromMap)) {
      return fromMap;
    }
    return DEFAULT_COMPANY_NAME;
  }

  private String resolveSupportUrl(
    final NotificationsData content,
    final Map<String, String> dataMap) {
    if (content != null
      && content.supportUrl() != null
      && !content.supportUrl().isBlank()
      && !"null".equalsIgnoreCase(content.supportUrl())) {
      return content.supportUrl();
    }
    final String fromMap = dataMap.get("supportUrl");
    if (fromMap != null && !fromMap.isBlank() && !"null".equalsIgnoreCase(fromMap)) {
      return fromMap;
    }
    return DEFAULT_SUPPORT_URL;
  }

  private String escapeHtml(final String text) {
    if (text == null) {
      return "";
    }
    return text.replace("&", "&amp;")
      .replace("<", "&lt;")
      .replace(">", "&gt;")
      .replace("\"", "&quot;")
      .replace("'", "&#39;");
  }
}
