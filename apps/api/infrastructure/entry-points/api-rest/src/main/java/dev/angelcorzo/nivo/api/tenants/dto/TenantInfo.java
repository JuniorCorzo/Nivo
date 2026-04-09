package dev.angelcorzo.nivo.api.tenants.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;
import lombok.Builder;

@Builder
@Schema(requiredProperties = {"id", "companyName"})
public record TenantInfo(UUID id, String companyName) {}
