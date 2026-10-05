package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config;

import org.mapstruct.*;

@MapperConfig(
    componentModel = "spring",
    injectionStrategy = InjectionStrategy.CONSTRUCTOR,
		implementationName = "<CLASS_NAME>RestImpl",
    nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    unmappedSourcePolicy = ReportingPolicy.IGNORE,
    builder = @Builder)
public interface MapperStructConfig {}
