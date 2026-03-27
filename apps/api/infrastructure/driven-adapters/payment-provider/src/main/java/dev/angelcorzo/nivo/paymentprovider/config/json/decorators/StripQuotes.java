package dev.angelcorzo.nivo.paymentprovider.config.json.decorators;

import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import dev.angelcorzo.nivo.paymentprovider.config.json.StripDoubleQuotesDeserializer;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import tools.jackson.databind.annotation.JsonDeserialize;

@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotationsInside
@JsonDeserialize(using = StripDoubleQuotesDeserializer.class)
public @interface StripQuotes {}
