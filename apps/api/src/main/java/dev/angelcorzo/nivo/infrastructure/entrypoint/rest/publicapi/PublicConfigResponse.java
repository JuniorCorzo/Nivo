package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Public application configuration and feature flags")
public record PublicConfigResponse(
  @Schema(description = "Indicates whether tenant/account registration is enabled", example = "false") boolean accountCreationEnabled,
  @Schema(description = "Indicates whether online/digital payment module is enabled", example = "true") boolean paymentEnabled) {
}
