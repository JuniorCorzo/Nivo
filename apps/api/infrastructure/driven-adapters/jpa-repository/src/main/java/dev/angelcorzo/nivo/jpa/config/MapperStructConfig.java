package dev.angelcorzo.nivo.jpa.config;

import org.mapstruct.*;

/**
 * Global configuration for MapStruct mappers within the JPA adapter layer.
 *
 * <p>This interface defines common settings for all MapStruct mappers,
 * ensuring consistency in how domain entities are converted to and from
 * JPA data entities.</p>
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA Config)</p>
 * <p><strong>Responsibility:</strong> To provide a centralized configuration for MapStruct.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
@MapperConfig(
		componentModel = "spring",
		injectionStrategy = InjectionStrategy.CONSTRUCTOR,
		implementationName = "<CLASS_NAME>JpaImpl",
		nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL,
		unmappedTargetPolicy = ReportingPolicy.IGNORE,
		unmappedSourcePolicy = ReportingPolicy.IGNORE,
		builder = @Builder)

public interface MapperStructConfig {}
