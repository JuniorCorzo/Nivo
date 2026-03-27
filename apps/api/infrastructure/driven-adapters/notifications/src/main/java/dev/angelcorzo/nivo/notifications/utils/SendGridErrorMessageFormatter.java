package dev.angelcorzo.nivo.notifications.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class SendGridErrorMessageFormatter {
  private static final int MAX_ERROR_MESSAGE_LENGTH = 2_000;
  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  public String formatProviderError(int statusCode, String responseBody) {
    final String providerMessage = this.extractProviderErrorMessage(responseBody);
    return this.sanitizeErrorMessage(
        "SendGrid status=%d, message=%s".formatted(statusCode, providerMessage));
  }

  public String formatIoError(String errorMessage) {
    return this.sanitizeErrorMessage("SendGrid IO error: " + errorMessage);
  }

  private String sanitizeErrorMessage(String message) {
    if (message == null || message.isBlank()) {
      return "Unknown SendGrid error";
    }

    final String normalized = message.replace('\n', ' ').replace('\r', ' ').trim();
    if (normalized.length() <= MAX_ERROR_MESSAGE_LENGTH) {
      return normalized;
    }

    return normalized.substring(0, MAX_ERROR_MESSAGE_LENGTH);
  }

  private String extractProviderErrorMessage(String responseBody) {
    if (responseBody == null || responseBody.isBlank()) {
      return "Empty response body";
    }

    try {
      final JsonNode root = OBJECT_MAPPER.readTree(responseBody);
      final JsonNode errors = root.path("errors");

      if (!errors.isArray() || errors.isEmpty()) {
        return responseBody;
      }

      final StringBuilder messages = new StringBuilder();
      for (JsonNode error : errors) {
        final String message = error.path("message").asText("").trim();
        if (!message.isBlank()) {
          if (!messages.isEmpty()) {
            messages.append(" | ");
          }
          messages.append(message);
        }
      }

      if (!messages.isEmpty()) {
        return messages.toString();
      }
    } catch (Exception ex) {
      return responseBody;
    }

    return responseBody;
  }
}

