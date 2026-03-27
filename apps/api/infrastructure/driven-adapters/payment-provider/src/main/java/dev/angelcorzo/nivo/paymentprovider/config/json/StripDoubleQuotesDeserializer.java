package dev.angelcorzo.nivo.paymentprovider.config.json;

import dev.angelcorzo.nivo.model.utils.StringUtils;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.deser.std.StdDeserializer;

public class StripDoubleQuotesDeserializer extends StdDeserializer<String> {

  public StripDoubleQuotesDeserializer() {
    super(StripDoubleQuotesDeserializer.class);
  }

  @Override
  public String deserialize(JsonParser p, DeserializationContext ctxt) throws JacksonException {
    final String value = p.getString();
    return StringUtils.sanitize(value);
  }
}
