package dev.angelcorzo.nivo.domain.model.tenants.valueobject;

import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import java.util.UUID;
import lombok.Builder;

@Builder
public record TenantReference(UUID id, String companyName) {
  public static TenantReference of(Tenants tenant) {
    return new TenantReference(tenant.getId(), tenant.getCompanyName());
  }
}
