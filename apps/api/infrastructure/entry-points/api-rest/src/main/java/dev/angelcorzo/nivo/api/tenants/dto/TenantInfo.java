package dev.angelcorzo.nivo.api.tenants.dto;

import java.util.UUID;
import lombok.Builder;

@Builder
public record TenantInfo(UUID id, String companyName) {}
