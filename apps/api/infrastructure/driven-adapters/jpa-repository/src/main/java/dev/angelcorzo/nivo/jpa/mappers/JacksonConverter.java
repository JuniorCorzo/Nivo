package dev.angelcorzo.nivo.jpa.mappers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JacksonConverter {
  private final ObjectMapper objectMapper;

  public JsonNode toJsonNode(Object object) {
    return object != null ? objectMapper.valueToTree(object) : null;
  }

  public Object toObject(JsonNode jsonNode) {
    if (jsonNode == null || jsonNode.isNull()) return null;

    try {
      return objectMapper.treeToValue(jsonNode, Object.class);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  public Object toObject(String str) {
    try {
      return this.objectMapper.readValue(str, Object.class);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  public String toString(Object object) {
    if (object == null) return null;

    try {
      if (object instanceof String) return (String) object;

      return this.objectMapper.writeValueAsString(object);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  public <T> T toTypedObject(JsonNode jsonNode, Class<T> clazz) {
    if (jsonNode == null || jsonNode.isNull()) return null;

    try {
      return objectMapper.treeToValue(jsonNode, clazz);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }
}
