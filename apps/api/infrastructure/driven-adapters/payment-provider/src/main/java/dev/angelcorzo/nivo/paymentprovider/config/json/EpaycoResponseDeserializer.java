package dev.angelcorzo.nivo.paymentprovider.config.json;

import dev.angelcorzo.nivo.model.utils.StringUtils;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.EpaycoError;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.EpaycoResponse;
import dev.angelcorzo.nivo.paymentprovider.exceptions.PaymentProviderDeserializationException;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.BeanProperty;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.deser.std.StdDeserializer;

public class EpaycoResponseDeserializer extends StdDeserializer<EpaycoResponse<?>> {

  private final JavaType valueType;

  public EpaycoResponseDeserializer() {
    this(null);
  }

  protected EpaycoResponseDeserializer(JavaType valueType) {
    super(EpaycoResponse.class);
    this.valueType = valueType;
  }

  @Override
  public EpaycoResponseDeserializer createContextual(
      DeserializationContext ctxt, BeanProperty property) {
    JavaType type = ctxt.getContextualType();
    if (type != null && type.containedTypeCount() > 0) {
      JavaType innerType = type.containedType(0);
      return new EpaycoResponseDeserializer(innerType);
    }
    return this;
  }

  @Override
  public EpaycoResponse<?> deserialize(JsonParser p, DeserializationContext ctxt) {
    try {
      JsonNode node = p.readValueAsTree();
      boolean success = node.get("success").asBoolean();
      String titleResponse = StringUtils.sanitize(getTextOrNull(node, "titleResponse"));
      String textResponse = StringUtils.sanitize(getTextOrNull(node, "textResponse"));
      String lastResponse = StringUtils.sanitize(getTextOrNull(node, "lastResponse"));

      JsonNode dataNode = node.get("data");

      // Si data es un arreglo vacío o nulo, lo tratamos como null
      if (dataNode == null || dataNode.isNull() || (dataNode.isArray() && dataNode.isEmpty())) {
        dataNode = null;
      }

      if (success) {
        Object data = null;
        if (dataNode != null) {
          if (valueType != null) {
            data = ctxt.readTreeAsValue(dataNode, valueType);
          } else {
            data = ctxt.readTreeAsValue(dataNode, Object.class);
          }
        }
        return new EpaycoResponse.Success<>(true, titleResponse, textResponse, lastResponse, data);
      } else {
        EpaycoError error = null;
        if (dataNode != null) {
          error = ctxt.readTreeAsValue(dataNode, EpaycoError.class);
        }
        return new EpaycoResponse.Failure<>(
            false, titleResponse, textResponse, lastResponse, error);
      }
    } catch (Exception e) {
      throw new PaymentProviderDeserializationException("Error deserializando EpaycoResponse", e);
    }
  }

  private String getTextOrNull(JsonNode node, String fieldName) {
    JsonNode field = node.get(fieldName);
    if (field == null || field.isNull()) {
      return null;
    }
    return field.isString() ? field.asString() : field.toString();
  }
}
