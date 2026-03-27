package dev.angelcorzo.nivo.model.tenants.valueobject;

import java.util.UUID;

import dev.angelcorzo.nivo.model.tenants.Tenants;
import lombok.Builder;

@Builder
public record TenantReference(UUID id, String companyName) {
	public static TenantReference of(Tenants tenant) {
		return new TenantReference(tenant.getId(), tenant.getCompanyName());
	}
}
